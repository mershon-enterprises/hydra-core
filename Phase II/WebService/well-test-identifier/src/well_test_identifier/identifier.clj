(ns well-test-identifier.identifier
  (:require [clojure.core.async :refer [thread]]
            [clojure.data.codec.base64 :as b64]
            [clojure.java.io :as io]
            [clojure.string :as string]
            [clj-time.format :as f]
            [cheshire.core :refer :all]
            [well-test-identifier.amqp :as amqp]
            [well-test-identifier.smtp :as smtp]
            [well-test-identifier.zip :as zip]))


(defn- is-a-well-test
  "Checks for wellName, trailerNumber,  clientName, fieldName, and at least 3
  attachments"
  [{uuid :uuid
    well-test-data :data}]
  (println (format "Checking if dataset %s is a well test" uuid))

  ; we require well name, trailer number, client name, and field name to
  ; consider this a well test
  (let [required-keys ["wellName" "trailerNumber" "clientName" "fieldName"]]
    ; expect one text value of each required description
    (if (not-every?
          (fn [required-key]
            ; destructure the properties out of the data-item
            (some (fn [{type :type
                        description :description
                        value :value}]
                    (and (= "text" type)
                         (= required-key description)
                         (and (not (nil? value))
                              (not-empty value))))
                  well-test-data))
          required-keys)
      (do
        (println "Missing one or more required key.")
        (println (str "Keys were: "
                      (string/join "," (filter (fn [ds-item]
                                                 (= "text" (:type ds-item)))
                                               well-test-data))))
        false)

      ; expect at least 2 CSV file attachments
      (if (not (>= (count (filter (fn [{type :type mime-type :mime_type}]
                                    (and (= "attachment" type)
                                         (= "text/csv" mime-type)))
                                  well-test-data))
                   2))
        (do
          (println "Need at least 1 CSV attachments")
          false)
        ; expect at least 1 Excel file attachment
        (if (not (>= (count (filter (fn [{type :type mime-type :mime_type}]
                                      (and (= "attachment" type)
                                           (= "application/vnd.ms-excel" mime-type)))
                                    well-test-data))
                     1))
          (do
            (println "Need at least 1 Excel attachment")
            false)

          ; if all 3 criteria are matched, this is a well test
          (do
            (println (format "Dataset %s is a well test" uuid))
            true))))))

(def iso-formatter (f/formatters :date-time-no-ms))
(def base-name-date-formatter (f/formatter "yyMMdd"))


(defn build-base-name
  [{created-by :created_by
    date-created :date_created
    well-test-data :data}]

  ; Base name is the same in all cases:
  ;
  ; CBW         - 110127 CHEV   KR    275H LYONS CBW.xlsx
  ;               yyMMdd CLIENT FIELD WELL LEASE 'CBW'.xlsx
  ;
  ; Well Report - 110127 CHEV   KR    275H LYONS.csv
  ;               yyMMdd CLIENT FIELD WELL LEASE.csv
  ;
  ; Historical  - 110127 CHEV   KR    275H LYONS HIST.csv
  ;               yyMMdd CLIENT FIELD WELL LEASE 'HIST'.csv
  ;
  ; Zip File    - 110127 CHEV   KR    275H LYONS REPORT.csv
  ;
  ;
  ; CLIENT should be capped to 4 letters
  ;
  ; FIELD should be an acronym of the first letter of each word,
  ; e.g. Kern River=KR, Lost Hills=LH, South Belridge=SB
  (let [date (f/unparse base-name-date-formatter
                        (f/parse iso-formatter date-created))
        client (:value (first (filter (fn [{type :type descr :description}]
                                        (and (= "text" type)
                                             (= "clientName" descr)))
                                      well-test-data)))
        field (:value (first (filter (fn [{type :type descr :description}]
                                       (and (= "text" type)
                                            (= "fieldName" descr)))
                                     well-test-data)))
        well (:value (first (filter (fn [{type :type descr :description}]
                                      (and (= "text" type)
                                           (= "wellName" descr)))
                                    well-test-data)))
        lease (:value (first (filter (fn [{type :type descr :description}]
                                       (and (= "text" type)
                                            (= "leaseName" descr)))
                                     well-test-data)))
        username (.substring created-by 0 (.indexOf created-by "@"))
        client-abbrv (.substring client 0 (Math/min (.length client) 4))
        field-abbrv (string/join "" (map (fn [x]
                                           (.substring x 0 1))
                                         (string/split field #" ")))]

    (.toUpperCase (string/join " " (filter identity [date
                                     client-abbrv
                                     field-abbrv
                                     well
                                     lease
                                     username])))))

(defn find-file-index-cut-by-weight
  [well-test-data]
  ; there can only be one water cut-by-weight spreadsheet per test
  (.indexOf well-test-data
            (first (filter (fn [{type :type mime-type :mime_type}]
                             (and (= "attachment" type)
                                  (= "application/vnd.ms-excel" mime-type)))
                           well-test-data))))

(defn find-file-indicies-well-report
  [well-test-data]
  ; there can be multiple well reports per test, and they are identified as
  ; being CSV files containing the string "Well Test ID" in the first line
  ; somewhere
  (map (fn [x] (.indexOf well-test-data x))
       (filter (fn [{type :type
                     filename :filename
                     mime-type :mime_type
                     contents :contents}]
                 (if (and (= "attachment" type)
                          (= "text/csv" mime-type))
                   (let [contents-decoded (String. (b64/decode (.getBytes contents "UTF-8")))
                         contents-abbrv (.substring contents-decoded
                                                    0 (Math/min (Integer. (.length contents-decoded))
                                                                1000))]
                     (not= -1 (.indexOf contents-abbrv "Well Test ID")))))
               well-test-data)))

(defn identify
  [well-test-json]
  (let [data-set (parse-string well-test-json true)]
    (if (is-a-well-test data-set)
      (let [well-test-data       (:data data-set)
            base-name            (build-base-name data-set)
            rename-rpc (fn [uuid old-filename new-filename]
                         (println "Invoking RPC call to rename attachment...")
                         (println (format "Renaming attachment '%s' to '%s'"
                                          old-filename
                                          new-filename))
                         (amqp/invoke
                           "text/json"
                           (generate-string {:command "do-rename-attachment"
                                             :args [uuid
                                                    old-filename
                                                    new-filename]})))
            index-cbw            (find-file-index-cut-by-weight well-test-data)
            indicies-well-report (find-file-indicies-well-report well-test-data)]

        ; identify the client name and field name values in the dataset,
        ; and use them to populate their respective tables associated to the
        ; dataset

        ; This is the naming convention format PI uses:
        ;
        ; CBW         - 110127 Chev   KR    275H Lyons CBW.xlsx
        ;               yyMMdd CLIENT FIELD WELL LEASE 'CBW'.xlsx
        ;
        ; Well Report - 110127 Chev   KR    275H Lyons.csv
        ;               yyMMdd CLIENT FIELD WELL LEASE.csv
        ;
        ; Historical  - 110127 Chev   KR    275H Lyons Hist.csv
        ;               yyMMdd CLIENT FIELD WELL LEASE 'Hist'.csv
        (thread
          ; TODO -- rename the CBW to follow naming convention

          ; rename all well-tests to follow naming convention
          (doall
            ; use map-indexed because doseq [x sequence] won't work on sequences
            ; of primitives like int
            (map-indexed
              (fn [x well-report-index]
                (let [old-filename (:filename (nth well-test-data well-report-index))
                      ; files should be named as follows:
                      ;
                      ; 0th : basename REPORT.csv
                      ; 1st : basename REPORT-2.csv
                      ; 2nd : basename REPORT-3.csv
                      ;
                      ; ... etc.
                      new-filename (str (format "%s REPORT%s.csv"
                                                base-name
                                                (if (> x 0)
                                                  (str "-" (+ x 1))
                                                  "")))
                      response (rename-rpc (:uuid data-set) old-filename new-filename)]
                  (if (not= response true)
                    (println (format "Unexpected response to rename: %s"
                                     response)))

                  ; TODO - update the local copy of well-test-json so we only
                  ; use the new filename going forward
                  ))
              indicies-well-report))

          ; TODO -- rename all historical files to follow naming convention

          ; bundle together attachments as a temporary zip file, email out to
          ; the administrative users, and then delete the file
          (let [zip-filename (zip/zip-well-test base-name data-set)
                test-notes (:value (first (filter
                                            (fn [{type :type descr :description}]
                                              (and (= "text" type)
                                                   (= "wellTestNotes" descr)))
                                            well-test-data)))]
            (smtp/send-well-test (str "Red Lion Well Test - " base-name)
                                 (if (and (not (nil? test-notes))
                                          (not-empty test-notes))
                                   test-notes
                                   "<h2>No test notes provided.</h2>")
                                 zip-filename)
            (io/delete-file zip-filename)

            ; fire another AMQP event with the original data, but on the
            ; well-test routing key, to trigger downstream reporting
            (amqp/broadcast "text/json" "well-test" well-test-json)))))))
