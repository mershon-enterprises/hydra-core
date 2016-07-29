(ns web-service.user
  (:use [ring.util.response]
        [web-service.authentication]
        [web-service.db]
        [web-service.session])
  (:require [clojure.java.jdbc :as sql]
            [web-service.constants :as constants]
            [web-service.schema :as queries :include-macros true]))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                INTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn add-user!
  "add the specified user"
  [email-address]
  (try (queries/add-user! {:email_address email-address} {})
       true
       (catch Exception e
         false)))

(defn get-user
  "get the specified user"
  [email-address]
  (queries/get-user {:email_address email-address} {:result-set-fn (comp first)}))

(defn get-user-access
  "get the access for the specified user"
  [email-address]
  (queries/get-user-access {:email_address email-address}
                           {:row-fn :description}))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                EXTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; get the specified user, as an HTTP response
(defn user-get
  [email-address target-user-email-address]

  ; let a user view their own information but not the information of others,
  ; unless they have the Manage Users access
  (let [sanitized-email (-> (or target-user-email-address "")
                            (.trim)
                            (.toLowerCase))
        access (set (get-user-access email-address))
        can-access (or (= sanitized-email  email-address)
                       (contains? access constants/manage-users))]
    (if can-access
      (let [user (get-user sanitized-email)]
        ; log the activity in the session
        (log-detail email-address
                    constants/session-activity
                    (str constants/session-get-user " "
                         sanitized-email))
        (if user
          (response {:response user})
          (not-found "User not found"))) ; inconceivable!
      (access-denied constants/manage-users))))


; list the users in the database, as an HTTP response
(defn user-list
  [email-address]

  ; log the activity in the session
  (log-detail email-address
              constants/session-activity
              constants/session-list-users)

  (let [access (set (get-user-access email-address))]
    (if (contains? access constants/manage-users)
      (response {:response (sql/query
                             (db)
                             ["select * from public.user"]
                             :row-fn :email_address)})
      (access-denied constants/manage-users))))


; list the access levels for the specified user, as an HTTP response
(defn user-access-list
  [email-address target-email-address]

  ; log the activity in the session
  (log-detail email-address
              constants/session-activity
              (str constants/session-get-user-access " " target-email-address))

  ; let a user view their own information but not the information of others,
  ; unless they have the Manage Users access
  (let [sanitized-email (-> (or target-email-address "")
                            (.trim)
                            (.toLowerCase))
        access (set (get-user-access email-address))
        can-access (or (= email-address sanitized-email)
                       (contains? access constants/manage-users))]
    (if can-access
      (response {:response (get-user-access sanitized-email)})
      (access-denied constants/manage-users))))


; add the specified permission to the user, as an HTTP response
(defn user-access-add
  [email-address target-email-address access-level]

  ; log the activity in the session
  (log-detail email-address
              constants/session-activity
              (str constants/session-add-user-access " "
                   target-email-address " " access-level))

  (let [sanitized-email (-> (or target-email-address "")
                            (.trim)
                            (.toLowerCase))
        access (set (get-user-access email-address))
        user-query (str "select * from public.user "
                        "where email_address = ?::character varying(255) ")
        access-level-query (str "select * from user_access_level "
                                "where description = ?::character varying(255) ")
        user? (not (empty? (sql/query (db)
                                      [user-query
                                       sanitized-email])))
        access-level? (not (empty? (sql/query (db)
                                              [access-level-query
                                               access-level])))]

    (cond
      (not (contains? access constants/manage-users))
      (access-denied constants/manage-users)

      (not access-level?)
      (status (response {:response (str "User access level doesn't exists: "
                                        access-level)}) 400)

      (not user?)
      (status (response {:response (str "Target user level doesn't exists: "
                                        sanitized-email)}) 400)

      :else
      (let
        [query (str "insert into public.user_to_user_access_level "
                    "(user_id, access_level_id) "
                    "values ("
                    "(select id from public.user where email_address=?), "
                    "(select id from public.user_access_level where description=?))")
         success (try (sql/execute! (db) [query
                                          sanitized-email
                                          access-level])
                      true
                      (catch Exception e
                        (println (.getMessage e))
                        (println (.getMessage (.getNextException e)))
                        false))]

        ; if we successfully created the user access level, return a "created"
        ; status and invoke user-access-list
        ; otherwise, return a "conflict" status
        (if success
          (status (user-access-list email-address sanitized-email) 201)

          ;TODO conflict can not be determined by success of excuted query
          ;table constraint for user_id and access_level_id is not
          ;implemented
          (status (response {:response (str "User access for "
                                            sanitized-email
                                            " already exists: "
                                            access-level)})
                  409))))))
