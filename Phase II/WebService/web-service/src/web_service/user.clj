(ns web-service.user
  (:use [ring.util.response]
        [web-service.db])
  (:require [clojure.java.jdbc :as sql]
            [compojure.route :as route]))

; list the users in the database
(defn user-list
  []
  (response
    {:emails
     (sql/query
       db
       ["select * from public.user"]
       :row-fn :email_address)}))

; register a user by username
(defn user-register
  [email_address]
  (response
    {:success
     (try
       (sql/execute!
         db
         ["insert into public.user (email_address) values (?)" email_address])
       true
       (catch Exception e
         (println (.getMessage e))
         false))}))

