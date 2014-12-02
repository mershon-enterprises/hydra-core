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
  [{uuid           :uuid
    date-created   :date_created
    created-by     :created_by
    well-test-data :data}]

  (let [zip-filename "REPORT.zip"
        attachments (into [] (filter (fn [{type :type mime-type :mime_type}]
                                       (= "attachment" type))
                                     well-test-data))]


    ; sample filename "141125 CHEV LH ANTUNEZ REPORT.zip"
    (println (str "\nCreating zip file '" zip-filename "':"))
    (with-open [file (io/output-stream zip-filename)
                zip  (ZipOutputStream. file)
                wrt  (io/writer zip)]
      (doseq [f attachments]
        (let [binary (b64/decode (.getBytes (:contents f) "UTF-8"))
              binary-stream (io/input-stream binary)]
          (println (str "- Attaching " (:filename f)))
          (binding [*out* wrt]
            (with-entry zip (:filename f)
              (io/copy binary-stream zip))))))))
