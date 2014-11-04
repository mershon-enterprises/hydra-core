(ns dummy.datasets
  (:use [web-service.db]

        )
  (:require [clojure.data.generators :as gen])
  )

(defn mock-data-item
  []
  ; create a random data item in a dataset
  )

(defn mock-attachment
  []
  ; create fake attachment data
  )

(defn mock-dataset
  []
  ; create a dataset randomly either with or without an attachment.
  ; if an attachment is created, it will be a one-line CSV with some junk data
  (let [create-attachment (gen/boolean)]
    (if create-attachment
      (println "create attachment")
      (println "don't create")))
  )

(defn mock-datasets
  [count]
  ; create [count] datasets with and without attachments
  (dotimes [n count]
    (mock-dataset))
  true)
