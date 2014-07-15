(ns web-service.user
  (:use [ring.util.response]
        [web-service.db]
        [web-service.session])
  (:require [clojure.java.jdbc :as sql]
            [compojure.route :as route]))

; get the specified user
(defn get-user
  [email-address]
  (first
    (sql/query
      db
      ["select * from public.user where email_address=?" email-address])))

; get the specified user, as an HTTP response
(defn user-get
  [email-address]
  (let
    [user (get-user email-address)]
    (if user
      (response user)
      (not-found "User not found"))))

; list the users in the database
(defn user-list
  [session]
  (let [required-access "Manage Users"]
    (if (has-access session required-access)
      (response
        (sql/query
          db
          ["select * from public.user"]
          :row-fn :email_address))
      (access-denied required-access))))

; register a user by username
(defn user-register
  [email-address]
  (let
    [success (try
               (sql/execute!
                 db
                 ["insert into public.user (email_address) values (?)" email-address])
               true
               (catch Exception e
                 (println (.getMessage e))
                 false))]
    ; if we successfully created the user, return a "created" status and invoke
    ; user-get
    ; otherwise, return a "conflict" status
    (if success
      (status (user-get email-address) 201)
      (status {:body "User already exists"} 409))))

; get the access for the specified user
(defn get-user-access
  [email-address]
  (sql/query
      db
      [(str "select distinct ual.description "
            "from public.user u "
            "left join public.user_to_user_access_level u2ual "
            "  on u.id=u2ual.user_id "
            "inner join public.user_access_level ual "
            "  on ual.id=u2ual.access_level_id "
            "where u.email_address=?") email-address]
      :row-fn :description))

; list the access levels for the specified user
(defn user-access-list
  [email-address]
  (response (get-user-access email-address)))

; add the specified permission to the user
(defn user-access-add
  [email-address access-level]
  (let
    [success (try
               (sql/execute!
                 db
                 [(str "insert into public.user_to_user_access_level "
                       "(user_id, access_level_id) "
                       "values ("
                       "(select id from public.user where email_address=?), "
                       "(select id from public.user_access_level where description=?))")
                  email-address access-level])
               true
               (catch Exception e
                 (println (.getMessage e))
                 (println (.getMessage (.getNextException e)))
                 false))]

    ; if we successfully created the user access level, return a "created"
    ; status and invoke user-get
    ; otherwise, return a "conflict" status
    (if success
      (status (user-access-list email-address) 201)
      (status {:body (str "User access for "
                          email-address
                          " already exists: "
                          access-level)}
              409))))
