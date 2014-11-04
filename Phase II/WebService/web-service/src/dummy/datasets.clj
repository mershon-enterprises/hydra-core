(ns dummy.datasets
  (:use [cheshire.core]
        [web-service.data])
  (:require [clojure.data.generators :as gen]
            [clojure.data.codec.base64 :as b64]))

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
   :contents (String. (b64/encode (.getBytes "a,b,c,d,e,f,g")))})

(defn mock-dataset
  "create a dataset that randomly either has or does not have an attachment"
  []
  (def data [])

  ; maybe create an attachment, maybe not
  (if (gen/boolean)
    (def data (conj data (mock-attachment))))

  ; create a random number of data items, up to 10 items
  (dotimes [n (rand-int 10)]
    (def data (conj data (mock-data-item))))

  {:email_address "admin@example.com"
   :uuid (str (java.util.UUID/randomUUID))
   :date_created (new java.util.Date)
   :created_by "admin@example.com"
   :data data})

(defn mock-datasets
  "create [count] dummy datasets, both with and without attachments"
  [count]
  (dotimes [n count]
    (let [ds (mock-dataset)]
      (data-submit
        (:email_address ds)
        (:uuid ds)
        (generate-string (:date_created ds))
        (:created_by ds)
        (generate-string (:data ds)))))
  true)
