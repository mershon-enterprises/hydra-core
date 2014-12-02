(ns well-test-identifier.zip
  (:require [clojure.string :as string]
            [clojure.java.io :as io]
            [cheshire.core :refer :all]
            [clj-time.format :as f]
            [clojure.data.codec.base64 :as b64])
  (:import java.util.zip.ZipEntry
           java.util.zip.ZipOutputStream))

(def iso-formatter (f/formatters :date-time-no-ms))
(def zip-date-formatter (f/formatter "yyMMdd"))

(defmacro ^:private with-entry
  [zip entry-name & body]
  `(let [^ZipOutputStream zip# ~zip]
     (.putNextEntry zip# (ZipEntry. ~entry-name))
     ~@body
     (flush)
     (.closeEntry zip#)))

(defn zip-well-test
  [{uuid           :uuid
    date-created   :date_created
    created-by     :created_by
    well-test-data :data}]

  ; sample filename is "141125 CHEV   LH    ANTUNEZ  REPORT.zip"
  ; so the formula is  "yyMMdd CLIENT FIELD USERNAME 'REPORT'.zip
  ;
  ; CLIENT should be capped to 4 letters
  ;
  ; FIELD should be an acronym of the first letter of each word,
  ; e.g. Kern River=KR, Lost Hills=LH, South Belridge=SB
  (let [date (f/unparse zip-date-formatter
                        (f/parse iso-formatter date-created))
        client (:value (first (filter (fn [{type :type descr :description}]
                                        (and (= "text" type)
                                             (= "clientName" descr)))
                                      well-test-data)))
        field (:value (first (filter (fn [{type :type descr :description}]
                                       (and (= "text" type)
                                            (= "fieldName" descr)))
                                     well-test-data)))
        username (.substring created-by 0 (.indexOf created-by "@"))
        client-abbrv (.substring client 0 (Math/min (.length client) 4))
        field-abbrv (string/join "" (map (fn [x]
                                           (.substring x 0 1))
                                         (string/split field #" ")))
        zip-filename (str (.toUpperCase (string/join " " [date
                                                          client-abbrv
                                                          field-abbrv
                                                          username
                                                          "report"]))
                          ".zip")
        attachments (into [] (filter (fn [{type :type}]
                                       (= "attachment" type))
                                     well-test-data))]

    (println (str "\nCreating zip file '" zip-filename "':"))
    (with-open [file (io/output-stream zip-filename)
                zip  (ZipOutputStream. file)
                wrt  (io/writer zip)]

      (doseq [f attachments]
        ; we need to base64-decode the file contents to write the attachment
        ; into the zip file
        (let [binary (b64/decode (.getBytes (:contents f) "UTF-8"))
              binary-stream (io/input-stream binary)]
          (println (str "- Attaching " (:filename f)))
          (binding [*out* wrt]
            (with-entry zip (:filename f)
              (io/copy binary-stream zip))))))))
