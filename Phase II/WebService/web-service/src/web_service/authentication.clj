(ns web-service.authentication
  (:use [ring.util.response]
        [web-service.user]
        [web-service.session])
  (:require [compojure.core :refer :all]))

; login to the API or error
(defn login
  [session email-address password]

  (let [current-email (:email-address session)
        bad-credentials {:body "Invalid email or password"
                         :status 401}]

    (if current-email
      ; we're already logged in
      (response (str "Currently logged in as "
                     current-email))

      ; we're not logged in, so maybe we're trying to login
      (if email-address
        ; TODO -- authenticate the user to the LDAP server
        (let [user (get-user email-address)]
          (if user
            {:body (str "Now logged in as " email-address)
             ; store the email address and permissions to the session
             :session {:email-address email-address
                       :access (get-user-access email-address)}}

            ; invalid user
            bad-credentials))

        ; no email was specified
        bad-credentials))))

; logout of the API
(defn logout
  []

  {:body "Now logged out"
   :session {:email-address nil}})
