(ns web-service.authentication
  (:use [ring.util.response]
        [web-service.db]
        [web-service.session]
        [web-service.user-helpers]
        [clojure.string :only (join split)])
  (:require [compojure.core :refer :all]
            [clj-ldap.client :as ldap]
            [clojure.tools.logging :as log]
            [clojure.java.jdbc :as sql]
            [clj-time.core :as t]
            [clj-time.coerce :as c]
            [crypto.random]
            [web-service.constants :as constants]))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                INTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


(defn- get-user-ldap
  [email-address password]
  (def ^:dynamic user-data nil)
  (let [ldap-server (ldap/connect {:host "192.168.138.12"
                                   :bind-dn "pic\\admin"
                                   :password "adminpassword"})
        search-fn (fn [x]
                    (def user-data {:account-name (:sAMAccountName x)
                                    :dn (:dn x)})
                    (log/debug (str "Found user " user-data)))]
    (try
      ; first login as the base user to check if the email address exists
      (ldap/search! ldap-server
                    "dc=pic,dc=local"
                    {:filter (str "(&(objectClass=user)(mail=" email-address "))")}
                    search-fn)

      (catch Exception e
        ; do nothing
        nil))

    ; now, try to authenticate as that user
    (if (not (nil? user-data))
      (do
        (log/trace "LDAP account exists")
        (if (ldap/bind? ldap-server
                        (str "pic\\" (:account-name user-data))
                        password)
          (do
            (log/trace "login to LDAP successful")
            (let [user (ldap/get ldap-server (:dn user-data))]
             {:first-name (:givenName user)
              :last-name (:sN user)
              :email-address (:mail user)}
             ))
         nil))
      nil)))


; response helper for access denied
(defn- invalid-token
  []
  (status {:body (str "Access Denied: Invalid API Token")}
          401))


; expire the specified API token
(defn expire-token
  [api-token]
 (let [expire-query (str "delete from public.user_api_token "
                         "where api_token=crypt(?, api_token)")]
   (try (sql/execute! db [expire-query api-token])
        true
        (catch Exception e
          (println (.getMessage e))
          false))))


; get the user associated with the specified API token
(defn get-user-by-token
  [api-token]
  (let [query (str "select u.* from public.user_api_token ut "
                   "inner join public.user u on u.id = ut.user_id "
                   "where ut.api_token=crypt(?, ut.api_token) "
                   "and ut.expiration_date > now()")]
    (first (sql/query db [query api-token]))))


; check the specified API token for validity
(defn is-token-valid
  [api-token]
  (let [query (str "select * from public.user_api_token "
                   "where api_token=crypt(?, api_token) "
                   "and expiration_date > now()")]
    (not (empty? (sql/query db [query api-token])))))


; create an API token for the user
(defn- make-token
  [email-address]
  (let [api-token (str (crypto.random/hex 255))
        expiration-date (c/to-sql-date (t/plus (t/now) (t/days 7)))
        ; we store the hash of the api token to the database, not the token
        ; itself, because security
        query (str "insert into public.user_api_token "
                   "(api_token, expiration_date, user_id) values "
                   "(crypt(?, gen_salt('bf', 7)), ?, "
                   "(select id from public.user where email_address=?)"
                   ")")
        success (try (sql/execute! db [query
                                       api-token
                                       expiration-date
                                       email-address])
                     true
                     (catch Exception e
                       (println (.getMessage e))
                       false))]
    (if success
      {:token api-token
       :token_expiration_date expiration-date})))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                EXTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; authenticate to the API or error
(defn authenticate
  [email-address password]
  (let [bad-credentials {:body "Invalid email or password"
                         :status 401}
        handle-user (fn [x]
                      ; log the start of the session in the database
                      (start email-address)

                      (let [api-token (make-token email-address)]
                        {:body
                         (merge
                           {:response {:email_address (:email-address x)
                                       :first_name (:first-name x)
                                       :last_name (:last-name x)
                                       :access (get-user-access (:email-address x))}}
                           api-token)}))]

    ; we need both an email and password to authenticate
    (if (and email-address password)
      ; authenticate the user to the LDAP server first, and only if the user
      ; exists in LDAP, try to verify the user to the databsae
      (let [ldap-user (get-user-ldap email-address password)
            db-user (get-user email-address)]
        (if ldap-user
          (if db-user
            (handle-user ldap-user)

            ; otherwise, create the user first
            (do
              (add-user email-address)
              (handle-user ldap-user))
            )
          ; invalid user
          bad-credentials))

      ; no email was specified
      bad-credentials)))


; guard the specified function from being run unless the API token is valid
(defn guard
  [api-token fun]
  (if (is-token-valid api-token)
    (let [user (get-user-by-token api-token)
          new-token (if user (make-token (:email_address user)))]
      (expire-token api-token)
      ; return a modified result object with the token information
      ; included
      (let [fn-results (fun)]
        {:status (:status fn-results)
         :headers (:headers fn-results)
         :body (merge (:body fn-results) new-token)}))
    (invalid-token)))
