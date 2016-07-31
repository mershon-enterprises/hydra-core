(ns web-service.authentication.ldap
  (:require [clj-ldap.client :as ldap]
            [clojure.tools.logging :as log]
            [environ.core :refer [env]]))

(defn config
  []
  {:name "ldap"})

(def ldap-credentials {:domain   (env :ldap-domain)
                       :host     (env :ldap-host)
                       :bind-dn  (env :ldap-bind-dn)
                       :password (env :ldap-password)})

(defn find-user
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
                    (str "dc=" (:domain ldap-credentials) ",dc=local")
                    {:filter (str "(&(objectClass=user)(mail=" email-address "))")}
                    search-fn)

      (catch Exception e
        ; do nothing
        nil))

    ; now, authenticate and pull the user's data directly
    (if (not (nil? user-data))
      (do
        (log/trace "LDAP account exists")
        (let [user (ldap/get ldap-server (:dn user-data))
              groups (:memberOf user)]
          {:account-name (:sAMAccountName user)
           :first-name (:givenName user)
           :last-name (:sn user)
           :email-address (:mail user)
           :is-admin (and (not (empty? groups))
                          (not= (.indexOf groups "Domain Admins") -1))}))
      nil)))


(defn login
  [email-address password]
  (let [ldap-user (find-user email-address)
        ldap-server (ldap/connect ldap-credentials)]

    ; now, try to authenticate as that user
    (if (and (not (nil? ldap-user))
             (ldap/bind? ldap-server
                         (str (:domain ldap-credentials) "\\" (:account-name ldap-user))
                         password))
      (do
        (log/trace "login to LDAP successful")
        ldap-user)
      nil)))
