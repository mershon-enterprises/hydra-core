(ns web-service.user
  (:use [ring.util.response]
        [web-service.db])
  (:require [clojure.java.jdbc :as sql]
            [compojure.route :as route]))

; add the specified permission to the user
(defn user-access-add
  [email-address access-level]
  (response
    {:success
     (try
       (sql/execute!
         db
         [(str "insert into public.user_to_user_access_level "
               "(user_id, access_level_id) "
               "values ("
               "(select id from public.user where email_address=?), "
               "(select id from public.user_access_level where description=?))")
          email-address access-level]
         )
       true
       (catch Exception e
         (println (.getMessage e))
         false))}))

; list the users in the database
(defn user-access-list
  [email-address]
  (response
    {:access
     (sql/query
       db
       [(str "select distinct ual.description "
             "from public.user u "
             "left join public.user_to_user_access_level u2ual "
             "  on u.id=u2ual.user_id "
             "inner join public.user_access_level ual "
             "  on ual.id=u2ual.access_level_id")]
       :row-fn :description)}))

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
  [email-address]
  (response
    {:success
     (try
       (sql/execute!
         db
         ["insert into public.user (email_address) values (?)" email-address])
       true
       (catch Exception e
         (println (.getMessage e))
         false))}))

