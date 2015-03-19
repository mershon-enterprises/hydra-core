(ns dummy.datasets
  (:use [cheshire.core]
        [web-service.db]
        [web-service.data])
  (:require [clojure.java.jdbc :as sql]
            [clojure.data.generators :as gen]
            [clojure.data.codec.base64 :as b64]))

(import java.sql.SQLException)

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

(defn mock-data-wellName-for-well-test
  "create a random data item to be part of a dataset"
  []
  {:type "text"
    :description "wellName"
    :value (str "Well-" (format "%02d" (rand-int 21)))})

(defn mock-data-trailerNumber-for-well-test
  "create a random data item to be part of a dataset"
  []
  {:type "text"
   :description "trailerNumber"
   :value (str (+ 1 (rand-int 20)))})

(defn mock-data-fieldName-for-well-test
  "create a random data item to be part of a dataset"
  []
  {:type "text"
   :description "fieldName"
   :value (rand-nth ["Kern River" "Midway-Sunset" "Wilmington"])})

(defn mock-attachment
  "create an attachment to be part of a dataset"
  []
  {:type "attachment"
   :created_by (+ 1 (rand-int 2))
   :filename (str "20" (+ 12 (rand-int 2))
                  "-" (format "%02d" (+ 1 (rand-int 12)))
                  "-" (format "%02d" (+ 1 (rand-int 30)))
                  ".csv")
   :mime_type "text/csv"
   :contents (String. (b64/encode (.getBytes (str
                                               "id,first_name,last_name,email,country,ip_address\n"
                                               "1,Janet,Turner,jturner0@pcworld.com,China,239.119.160.8"))))})

(defn mock-dataset
  "create a dataset that randomly either has or does not have an attachment"
  []
  (def data [])

  ; maybe create an attachment, maybe not
  (if (gen/boolean) (def data (conj data (mock-attachment))))
  (if (gen/boolean) (def data (conj data (mock-attachment))))
  (if (gen/boolean) (def data (conj data (mock-attachment))))

  ; create a random wellName, trailerNumber and fieldName
  (def data (conj data (mock-data-wellName-for-well-test)))
  (def data (conj data (mock-data-trailerNumber-for-well-test)))
  (def data (conj data (mock-data-fieldName-for-well-test)))

  ; create a random number of data items, up to 10 items
  ;(dotimes [n (rand-int 10)]
  ;  (def data (conj data (mock-data-item))))
  {:email_address "admin@example.com"
   :uuid (str (java.util.UUID/randomUUID))
   :date_created (new java.util.Date (- 1415667697780 (* (+ 1 (rand-int 35600)) 86400000)))
   :created_by (rand-nth ["admin@example.com"
                          "manager@example.com"])
   :data data})

(defn mock-datasets
  "create [count] dummy datasets, both with and without attachments"
  [count]
  (dotimes [n count]
    (let [ds (mock-dataset)
          client-location-query (str "update public.data_set "
                                     "set client_location_id=? "
                                     "where uuid::character varying=?")
          attachment-created-by-query (str "update public.data_set_attachment "
                                "set created_by=("
                                "  select created_by from public.data_set "
                                "  where uuid::character varying=?) "
                                "where data_set_id=("
                                "  select id from public.data_set "
                                "  where uuid::character varying=?)")
          text-created-by-query (str "update public.data_set_text "
                                "set created_by=("
                                "  select created_by from public.data_set "
                                "  where uuid::character varying=?) "
                                "where data_set_id=("
                                "  select id from public.data_set "
                                "  where uuid::character varying=?)")
          query-attachments (str "select dsa.id, dsa.filename "
                                 "from public.data_set_attachment dsa "
                                 "inner join public.data_set ds "
                                 " on ds.id = dsa.data_set_id "
                                 "where ds.uuid::character varying=?")
          ]
      (data-set-submit
        (:email_address ds)
        (:uuid ds)
        (generate-string (:date_created ds))
        (:created_by ds)
        (generate-string (:data ds)))
      (try
        (sql/execute! (db) [client-location-query (+ (rand-int 5) 1) (:uuid ds)])
        (sql/execute! (db) [attachment-created-by-query (:uuid ds) (:uuid ds)])
        (sql/execute! (db) [text-created-by-query (:uuid ds) (:uuid ds)])

        (doseq [attachment (sql/query (db) [query-attachments (:uuid ds)])]
          (def email_user_list [])

          (if (and (gen/boolean) (not (= (:email_address ds) "admin@example.com")))
            (def email_user_list (conj email_user_list "admin@example.com")))
          (if (and (gen/boolean) (not (= (:email_address ds) "manager@example.com")))
            (def email_user_list (conj email_user_list "manager@example.com")))

          (if (not (empty? email_user_list))
            (data-set-attachment-sharing
              (:email_address ds)
              (:uuid ds)
              (:filename attachment)
              (generate-string (java.util.Date.))
              (generate-string (java.util.Date. (+ (* 7 86400 1000) (.getTime (java.util.Date.)))))
              (generate-string email_user_list))))

        (catch Exception e
          (if (instance? SQLException e)
            (do (.getCause e)
                (println (.getNextException e)))
            (println (.getMessage e)))
          false))))
  true)
