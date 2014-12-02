(ns well-test-identifier.zip
  (:require [clojure.java.io :as io]
            [cheshire.core :refer :all]
            [clojure.data.codec.base64 :as b64])
  (:import java.util.zip.ZipEntry
           java.util.zip.ZipOutputStream))

(defmacro ^:private with-entry
  [zip entry-name & body]
  `(let [^ZipOutputStream zip# ~zip]
     (.putNextEntry zip# (ZipEntry. ~entry-name))
     ~@body
     (flush)
     (.closeEntry zip#)))

(defn zip-well-test
  [base-name
   {uuid           :uuid
    date-created   :date_created
    created-by     :created_by
    well-test-data :data}]

  (let [zip-filename (str base-name " REPORT.zip")
        attachments (into [] (filter (fn [{type :type}]
                                       (= "attachment" type))
                                     well-test-data))]

    (println (str "\nCreating zip file '" zip-filename "':"))
    (with-open [file (io/output-stream (str "/tmp/" zip-filename))
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
              (io/copy binary-stream zip))))))

    ; return the name of the zip file
    (str "/tmp/" zip-filename)))
