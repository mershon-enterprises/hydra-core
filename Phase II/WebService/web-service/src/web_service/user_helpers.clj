(ns web-service.user-helpers
  (:use [ring.util.response]
        [web-service.db]
        [web-service.session])
  (:require [clojure.java.jdbc :as sql]
            [web-service.constants :as constants]))


; add the specified user
(defn add-user
  [email-address]
  (let [query "insert into public.user (email_address) values (?)"]
    (try (sql/execute! (db) [query email-address])
         true
         (catch Exception e
           (println (.getMessage e))
           false))))


; get the specified user
(defn get-user
  [email-address]
  (first
    (sql/query
      (db)
      ["select * from public.user where email_address=?" email-address])))


; get the access for the specified user
(defn get-user-access
  [email-address]
  (sql/query
      (db)
      [(str "select distinct ual.description "
            "from public.user u "
            "left join public.user_to_user_access_level u2ual "
            "  on u.id=u2ual.user_id "
            "inner join public.user_access_level ual "
            "  on ual.id=u2ual.access_level_id "
            "where u.email_address=?") email-address]
      :row-fn :description))
