(ns web-service.authentication
  (:use [ring.util.response]
        [web-service.user]
        [web-service.session])
  (:require [compojure.core :refer :all]
            [clj-ldap.client :as ldap]
            [clojure.tools.logging :as log] ))

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


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                EXTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; login to the API or error
(defn login
  [session email-address password]

  (let [current-email (:email-address session)
        bad-credentials {:body "Invalid email or password"
                         :status 401}
        handle-user (fn [x]
                      {:body (str "Now logged in as " x)
                       ; store the email address and permissions to the session
                       :session {:email-address x
                                 :access (get-user-access x)}})]

    (if current-email
      ; we're already logged in
      (response (str "Currently logged in as "
                     current-email))

      ; we're not logged in, so maybe we're trying to login
      (if email-address
        ; authenticate the user to the LDAP server first, and only if the user
        ; exists in LDAP, try to verify the user to the databsae
        (let [ldap-user (get-user-ldap email-address password)
              db-user (get-user email-address)]
          (if ldap-user
            (if db-user
              (handle-user email-address)

              ; otherwise, create the user first
              (do
                (add-user email-address)
                (handle-user email-address))
              )
            ; invalid user
            bad-credentials))

        ; no email was specified
        bad-credentials))))

; logout of the API
(defn logout
  []

  {:body "Now logged out"
   :session {:email-address nil}})
