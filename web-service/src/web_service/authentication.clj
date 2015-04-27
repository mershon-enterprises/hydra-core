(ns web-service.authentication
  (:use [ring.util.response]
        [web-service.db]
        [web-service.session]
        [web-service.user-helpers])
  (:require [compojure.core :refer :all]
            [clj-ldap.client :as ldap]
            [clojure.tools.logging :as log]
            [clojure.java.jdbc :as sql]
            [clj-time.core :as t]
            [clj-time.coerce :as c]
            [crypto.random]
            [web-service.constants :as constants]
            [web-service.amqp :as amqp]
            [environ.core :refer [env]]
            [clj-time.format :as f]))

(import java.sql.SQLException)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                INTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


(def ldap-credentials {:host     (env :ldap-host)
                       :bind-dn  (env :ldap-bind-dn)
                       :password (env :ldap-password)})

(defn- find-user-ldap
  [email-address]
  (def ^:dynamic user-data nil)
  (let [ldap-server (ldap/connect ldap-credentials)
        search-fn (fn [x]
                    (def user-data {:account-name (:sAMAccountName x)
                                    :dn (:dn x)})
                    (log/debug (str "Found user " user-data)))]
    (try
      ; first login as the base user to check if the email address exists
      (ldap/search! ldap-server
                    "dc=domain,dc=local"
                    {:filter (str "(&(objectClass=user)(mail=" email-address "))")}
                    search-fn)

      (catch Exception e
        ; do nothing
        nil))

    ; now, authenticate and pull the user's data directly
    (if (not (nil? user-data))
      (do
        (log/trace "LDAP account exists")
        (let [user (ldap/get ldap-server (:dn user-data))]
          {:account-name (:sAMAccountName user)
           :first-name (:givenName user)
           :last-name (:sn user)
           :email-address (:mail user)
           :groups (:memberOf user)}))
      nil)))


(defn- get-user-ldap
  [email-address password]
  (let [ldap-user (find-user-ldap email-address)
        ldap-server (ldap/connect ldap-credentials)]

    ; now, try to authenticate as that user
    (if (and (not (nil? ldap-user))
             (ldap/bind? ldap-server
                         (str "domain\\" (:account-name ldap-user))
                         password))
      (do
        (log/trace "login to LDAP successful")
        ldap-user)
      nil)))


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
                            "(crypt(?, gen_salt('bf', 7)), ?::uuid, ?, "
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


(defn- format-ldap-user
  [ldap-user]
  {:response {:email_address (:email-address ldap-user)
              :first_name (:first-name ldap-user)
              :last_name (:last-name ldap-user)
              :access (get-user-access (:email-address ldap-user))}})


(defn- login-and-maybe-create-user
  [client-uuid email-address ldap-user db-user]
  (let [bad-credentials {:body "Invalid credentials"
                         :status 401}
        handle-user (fn [x]
                      ; log the start of the session in the database
                      (start email-address)
                      (amqp/broadcast "text/plain"
                                      "authentication"
                                      (str email-address " has logged in"))

                      (let [api-token (make-token email-address client-uuid)]
                        {:body (merge (format-ldap-user x) api-token)}))]
    (if ldap-user
      (if db-user
        (handle-user ldap-user)

        ; otherwise, create the user first
        (do
          (add-user email-address)
          (amqp/broadcast "text/plain"
                          "authentication"
                          (str email-address " has been created as a new user"))
          (handle-user ldap-user)))
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
    (if (and email-address password)
      ; authenticate the user to the LDAP server first, and only if the user
      ; exists in LDAP, try to verify the user to the databsae
      (let [ldap-user (get-user-ldap email-address password)
            db-user (get-user email-address)]
        (login-and-maybe-create-user client-uuid email-address ldap-user db-user))

      ; no email was specified
      bad-credentials)))


; authenticate a user on behalf of a domain admin
(defn admin-authenticate
  [client-uuid email-address password user-email-address]

  ; first, just authenticate the domain admin normally
  (let [bad-credentials {:body "Invalid credentials"
                         :status 401}
        admin (authenticate client-uuid email-address password)]
    (if admin
      ; now that we know the admin is a valid user, we want to ensure that the
      ; admin is actually a member of the Domain Admins group
      (let [admin-ldap-user (get-user-ldap email-address password)
            groups (:groups admin-ldap-user)
            ; there's no substring in Clojure, wtf
            is-domain-admin (and (not (empty? groups))
                                 (not= (.indexOf groups "Domain Admins") -1))]
        (if is-domain-admin
          (let [ldap-user (find-user-ldap user-email-address)
                db-user (get-user user-email-address)]
            (login-and-maybe-create-user client-uuid user-email-address ldap-user db-user))
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
  [email-address data-set-uuid filename exp-date]
  (let [client-uuid (str (java.util.UUID/randomUUID))
        sql-exp-date (c/to-sql-date (f/parse (f/formatters :date) exp-date))
        api-token-map (make-token email-address client-uuid sql-exp-date)
        api-token (:token api-token-map)
        link [(str "/data/" data-set-uuid "/" filename
                         "/?client_uuid=" client-uuid "&api_token=" api-token)]]
    (response {:response link})))
