(ns well-test-identifier.identifier
  (:use [well-test-identifier.smtp]
        [well-test-identifier.zip])
  (:require [clojure.string :as string]
            [cheshire.core :refer :all]
            [clj-time.format :as f]
            [clojure.java.io :as io]))



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
    (if (not (every?
               (fn [required-key]
                 ; destructure the properties out of the data-item
                 (some (fn [{type :type
                             description :description
                             value :value}]
                         (and (= "text" type)
                              (= required-key description)
                              (and (not (nil? value))
                                   (not (empty? value)))))
                       well-test-data))
               required-keys))
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

(defn identify
  [well-test-json]
  (let [data-set (parse-string well-test-json true)]
    (if (is-a-well-test data-set)
      (let [well-test-data (:data data-set)]
        ; TODO - identify the client name and field name values in the dataset,
        ; and use them to populate their respective tables associated to the
        ; dataset

        ; TODO - rename the attachments to match the format PI uses:
        ;
        ; CBW         - 110127 Chev   KR    275H Lyons CBW.xlsx
        ;               yyMMdd CLIENT FIELD WELL LEASE 'CBW'.xlsx
        ;
        ; Well Report - 110127 Chev   KR    275H Lyons.csv
        ;               yyMMdd CLIENT FIELD WELL LEASE.csv
        ;
        ; Historical  - 110127 Chev   KR    275H Lyons Hist.csv
        ;               yyMMdd CLIENT FIELD WELL LEASE 'Hist'.csv

        ; bundle together attachments as a temporary zip file, email out to
        ; the administrative users, and then delete the file
        (let [base-name (build-base-name data-set)
              zip-filename (zip-well-test base-name data-set)
              test-notes (:value (first (filter
                                          (fn [{type :type descr :description}]
                                            (and (= "text" type)
                                                 (= "wellTestNotes" descr)))
                                          well-test-data)))]
          (send-well-test (str "Red Lion Well Test - " base-name)
                          (if (and (not (nil? test-notes))
                                   (not (empty? test-notes)))
                            test-notes
                            "<h2>No test notes provided.</h2>")
                          zip-filename)
          (io/delete-file zip-filename))

        ; return true to fire another AMQP event with the original data, but on
        ; the well-test routing key, to trigger downstream reporting
        true)
      false)))