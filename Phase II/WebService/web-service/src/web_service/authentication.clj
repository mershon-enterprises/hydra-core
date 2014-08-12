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
            [crypto.password.bcrypt]))

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


; encrypt the specified API token to get the DB hash
(defn hash-token
  [api-token]
  (crypto.password.bcrypt/encrypt api-token))


; expire the specified API token
(defn expire-token
  [api-token]
 (let [expire-query (str "delete from public.user_api_token "
                         "where api_token=?")]
   (try (sql/execute! db [expire-query (hash-token api-token)])
        true
        (catch Exception e
          (println (.getMessage e))
          false))))


; check the specified API token for validity
(defn is-token-valid
  [api-token]
  (let [query (str "select * from public.user_api_token "
                   "where api_token=? "
                   "and expiration_date > now()")]
   (not (empty? (sql/query db [query (hash-token api-token)])))))


; create an API token for the user
(defn- make-api-token
  [email-address]
  (let [api-token (crypto.random/hex 255)
        api-token-hash (hash-token api-token)
        expiration-date (c/to-sql-date (t/plus (t/now) (t/days 7)))
        ; we store the hash of the api token to the database, not the token
        ; itself, because security
        query (str "insert into public.user_api_token "
                   "(api_token, expiration_date, user_id) values "
                   "(?, ?, "
                   "(select id from public.user where email_address=?)"
                   ")")
        success (try (sql/execute! db [query
                                       api-token-hash
                                       expiration-date
                                       email-address])
                     true
                     (catch Exception e
                       (println (.getMessage e))
                       false))]
    (if success
      {:token api-token
       :expiration-date expiration-date})))


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

                      (let [api-token (make-api-token email-address)]
                        {:body
                         {:email_address (:email-address x)
                          :first_name (:first-name x)
                          :last_name (:last-name x)
                          :access (get-user-access (:email-address x))
                          :api_token (:token api-token)
                          :api_token_expiration_date (:expiration-date api-token)}}))]

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
