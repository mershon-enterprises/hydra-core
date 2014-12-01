(ns well-test-identifier.zip
  (:require [clojure.java.io :as io]
            [cheshire.core :refer :all])
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
  (with-open [file (io/output-stream "foo.zip")
              zip  (ZipOutputStream. file)
              wrt  (io/writer zip)]
    (binding [*out* wrt]
      (doto zip
        (with-entry "foo.txt"
          (println well-test-data))
        )))
  )

;to zip a file you an io copy
;
;(with-open [output (ZipOutputStream. (io/output-stream "foo.zip"))
;            input  (io/input-stream "foo")]
;              (with-entry output "foo"
;                  (io/copy input output)))
