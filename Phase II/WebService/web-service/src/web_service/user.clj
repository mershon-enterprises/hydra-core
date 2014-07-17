(ns web-service.user
  (:use [ring.util.response]
        [web-service.db]
        [web-service.session])
  (:require [clojure.java.jdbc :as sql]
            [web-service.constants :as constants]))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                INTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; get the specified user
(defn get-user
  [email-address]
  (first
    (sql/query
      db
      ["select * from public.user where email_address=?" email-address])))


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


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                EXTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; get the specified user, as an HTTP response
(defn user-get
  [session email-address]

  ; let a user view their own information but not the information of others,
  ; unless they have the Manage Users access
  (let [can-access (or (= email-address (:email-address session))
                       (has-access session constants/manage-users))]
    (if can-access
      (let [user (get-user email-address)]
        (if user
          (response user)
          (not-found "User not found"))) ; inconceivable!
      (access-denied constants/manage-users))))


; list the users in the database, as an HTTP response
(defn user-list
  [session]
  (if (has-access session constants/manage-users)
    (response
      (sql/query
        db
        ["select * from public.user"]
        :row-fn :email_address))
    (access-denied constants/manage-users)))


; register a user by username, as an HTTP response
(defn user-register
  [email-address]
  (let
    [query "insert into public.user (email_address) values (?)"
     success (try (sql/execute! db [query email-address])
                  true
                  (catch Exception e
                    (println (.getMessage e))
                    false))]
    ; if we successfully created the user, return a "created" status, invoke
    ; get-user, and log the user into their first session
    ; otherwise, return a "conflict" status
    (if success
      (status {:body (get-user email-address)
               :session {:email-address email-address}} 201)
      (status {:body "User already exists"} 409))))


; list the access levels for the specified user, as an HTTP response
(defn user-access-list
  [session email-address]

  ; let a user view their own information but not the information of others,
  ; unless they have the Manage Users access
  (let [can-access (or (= email-address (:email-address session))
                       (has-access session constants/manage-users))]
    (if can-access
      (response (get-user-access email-address))
      (access-denied constants/manage-users))))


; add the specified permission to the user, as an HTTP response
(defn user-access-add
  [session email-address access-level]
  (if (has-access session constants/manage-users)
    (let
      [query (str "insert into public.user_to_user_access_level "
                  "(user_id, access_level_id) "
                  "values ("
                  "(select id from public.user where email_address=?), "
                  "(select id from public.user_access_level where description=?))")
       success (try (sql/execute! db [query email-address access-level])
                    true
                    (catch Exception e
                      (println (.getMessage e))
                      (println (.getMessage (.getNextException e)))
                      false))]

      ; if we successfully created the user access level, return a "created"
      ; status and invoke user-access-list
      ; otherwise, return a "conflict" status
      (if success
        (status (user-access-list session email-address) 201)
        (status {:body (str "User access for "
                            email-address
                            " already exists: "
                            access-level)}
                409)))
    (access-denied constants/manage-users)))
