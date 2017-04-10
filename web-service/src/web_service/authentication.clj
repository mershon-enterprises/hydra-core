(ns web-service.authentication
  (:use [ring.util.response]
        [web-service.db]
        [web-service.session]
        [web-service.user-helpers])
  (:require [compojure.core :refer :all]
            [clojure.tools.logging :as log]
            [clojure.java.jdbc :as sql]
            [clj-time.core :as t]
            [clj-time.coerce :as c]
            [clj-time.format :as f]
            [crypto.random]
            [environ.core :refer [env]]
            [web-service.constants :as constants]
            [web-service.amqp :as amqp]))

(import java.sql.SQLException)


; dynamically require the authenticator
(def authenticator (symbol (str "web-service.authentication."
                                (or (env :authenticator)
                                    "persona" ; default to Mozilla Persona
                                    ))))
(require authenticator)
(alias 'auth authenticator)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                INTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; response helper for access denied
(defn- invalid-token
  []
  (status {:body (str "Access Denied: Invalid API Token")}
          401))


; get the user associated with the specified API token
(defn get-user-by-token
  [api-token client-uuid]
  (let [query (str "select u.* from public.user_api_token ut "
                   "inner join public.user u on u.id = ut.user_id "
                   "where ut.client_uuid::character varying=? "
                   "and ut.api_token=crypt(?, ut.api_token) "
                   "and ut.expiration_date > now()")]
    (first (sql/query (db) [query client-uuid api-token]))))


; check the specified API token for validity
(defn is-token-valid
  [api-token client-uuid]
  (let [query (str "select * from public.user_api_token "
                   "where client_uuid::character varying=? "
                   "and api_token=crypt(?, api_token) "
                   "and expiration_date > now()")]
    (not (empty? (sql/query (db) [query client-uuid api-token])))))


; create an API token for the user
(def token-lock (Object.))
(defn- make-token
  ([email-address client-uuid]
   (make-token email-address client-uuid (c/to-sql-date (t/plus (t/now) (t/days 7)))))
  ([email-address client-uuid expiration-date]

   ; use a sempahore lock just to be extra-careful about transactional behavior
   (locking token-lock

     (let [conn (db)]
       (sql/with-db-transaction
         [conn db-spec]
         (do
           ; expire API tokens for the specified client uuid, and any other tokens
           ; which have passed their expiration date
           (let [expire-query (str "delete from public.user_api_token "
                                   "where expiration_date<now() "
                                   "or client_uuid::character varying=?")]
             (try (sql/execute! conn
                                [expire-query client-uuid]
                                :transaction? false)
               true
               (catch Exception e
                 (if (instance? SQLException e)
                   (do
                     (println e)
                     (println (.getNextException e)))
                   (println (.getMessage e)))
                 false)))

           ; create a new token
           (let [api-token (str (crypto.random/hex 255))
                 ; we store the hash of the api token to the database, not the
                 ; token itself, because security
                 query (str "insert into public.user_api_token "
                            "(api_token, client_uuid, expiration_date, user_id) values "
                            "(crypt(?, gen_salt('bf', 7)), ?::uuid, CAST(? AS TIMESTAMP WITH TIME ZONE), "
                            "(select id from public.user where email_address=?)"
                            ")")
                 success (try (sql/execute! conn
                                            [query
                                             api-token
                                             client-uuid
                                             expiration-date
                                             email-address]
                                            :transaction? false)
                           true
                           (catch Exception e
                             (if (instance? SQLException e)
                               (do
                                 (println e)
                                 (println (.getNextException e)))
                               (println (.getMessage e)))
                             (throw e)
                             false))]
             (if success
               {:token api-token
                :token_expiration_date expiration-date}))))))))


(defn- format-user
  [user-map]
  {:response {:email_address (:email-address user-map)
              :first_name (:first-name user-map)
              :last_name (:last-name user-map)
              :access (get-user-access (:email-address user-map))}})


(defn- login-and-maybe-create-user
  [client-uuid auth-user db-user]
  (let [email-address (:email-address auth-user)
        bad-credentials {:body "Invalid credentials"
                         :status 401}
        handle-user (fn [x]
                      ; log the start of the session in the database
                      (start email-address)
                      (amqp/broadcast "text/plain"
                                      "authentication"
                                      (str email-address " has logged in"))

                      (let [api-token (make-token email-address client-uuid)]
                        {:body (merge (format-user x) api-token)}))]
    (if auth-user
      (if db-user
        (handle-user auth-user)

        ; otherwise, create the user first
        (do
          (add-user! email-address)
          (amqp/broadcast "text/plain"
                          "authentication"
                          (str email-address " has been created as a new user"))
          (handle-user auth-user)))
      ; invalid user
      bad-credentials)))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                EXTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; authenticate to the API or error
(defn authenticate
  [client-uuid email-address password]
  (let [bad-credentials {:body "Invalid credentials"
                         :status 401}]

    ; we need both an email and password to authenticate
    (if (not-any? nil? [email-address password])
      ; authenticate the user to the authentication implementation first,
      ; and only if the user authenticates do we try to verify the user to the
      ; database
      (let [auth-user (auth/login email-address password)
            _ignore (println auth-user)
            sanitized-email (-> (or (:email-address auth-user) "")
                                (.trim)
                                (.toLowerCase))
            db-user (get-user sanitized-email)]
        (login-and-maybe-create-user client-uuid auth-user db-user))

      ; no email was specified
      bad-credentials)))


; authenticate a user on behalf of an admin
(defn admin-authenticate
  [client-uuid email-address password user-email-address]

  ; first, just authenticate the admin normally
  (let [bad-credentials {:body "Invalid credentials"
                         :status 401}
        admin (authenticate client-uuid email-address password)]
    (if (and (not-any? nil? [email-address password user-email-address])
             admin)
      ; now that we know the account in question is for a valid user, we want to
      ; ensure that the user is actually an admin
      (let [admin-auth-user (auth/login email-address password)]
        (if (:is-admin admin-auth-user)
          (let [auth-user (auth/find-user user-email-address)
                sanitized-user-email (-> (or (:email-address auth-user) "")
                                         (.trim)
                                         (.toLowerCase))
                db-user (get-user sanitized-user-email)]
            (login-and-maybe-create-user client-uuid auth-user db-user))
          bad-credentials))
      bad-credentials)))


; guard the specified function from being run unless the API token is valid
(defn guard
  [api-token client-uuid fun & args]
  (if (is-token-valid api-token client-uuid)
    ; return a modified result object with the token information
    ; included
    (let [user (get-user-by-token api-token client-uuid)
          fn-results (apply fun args)]
      ; only update the API token if the function call was successful
      (if (and (< (:status fn-results) 300)
               (>= (:status fn-results) 200))
        (let [new-token (if user (make-token (:email_address user) client-uuid))]
          {:status (:status fn-results)
           :headers (:headers fn-results)
           :body (merge (:body fn-results) new-token)})
        fn-results))
    (invalid-token)))


; guard the specified function from being run unless the API token is valid, and
; pass the user's email to the function as the first parameter
(defn guard-with-user
  [api-token client-uuid fun & args]
  (guard api-token
         client-uuid
         (let [user (get-user-by-token api-token client-uuid)]
           (fn []
             (apply fun (:email_address user) args)))))


; guard the specified file from being accessed unless the API token is valid,
; and pass the user's email to the function as the first parameter.
;
; don't invalidate the api token since the body cannot be modified
(defn guard-file-with-user
  [api-token client-uuid fun & args]
  (if (is-token-valid api-token client-uuid)
    ; unlike guard and guard-with-user, don't invalidate the token or append to
    ; the body
    (let [user (get-user-by-token api-token client-uuid)]
      (apply fun (:email_address user) args))
    (invalid-token)))

(defn generate-sharable-download-link
  [email-address data-set-uuid filename exp-date end-point-url]
  (let [client-uuid (str (java.util.UUID/randomUUID))
        api-token-map (make-token email-address client-uuid exp-date)
        api-token (:token api-token-map)
        link [(str end-point-url "/data/" data-set-uuid "/" filename
                         "/?client_uuid=" client-uuid "&api_token=" api-token)]]
    (response {:response link})))
