(ns dummy.datasets
  (:use [web-service.db]

        )
  (:require [clojure.data.generators :as gen])
  )

(defn- char-range
  [start end]
  (map char (range (int start) (inc (int end)))))

(defn- rand-letters
  "create a random string of letters, [count] characters long"
  [count]
  (gen/string (fn []
                (gen/rand-nth (char-range \a \z))) count))

(defn mock-data-item
  "create a random data item to be part of a dataset"
  []
  (let [type (rand-nth ["boolean"
                        "integer"
                        "real"
                        "text"])
        description (rand-letters 16)
        value (case type
                "boolean" (gen/boolean)
                "integer" (rand-int Integer/MAX_VALUE)
                "real" (gen/double)
                "text" (rand-letters 255))]
    {:type type
     :description description
     :value value}))

(defn mock-attachment
  "create an attachment to be part of a dataset"
  []
  {:type "attachment"
   :filename (str (rand-letters 14) ".csv")
   :mime_type "text/csv"
   :contents "a,b,c,d,e,f,g"})

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
