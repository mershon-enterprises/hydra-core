(ns web-service.authentication.firebase
  (:require [clojure.string :refer [join]]
            [clj-http.client :as client]
            [cheshire.core :refer :all]
            [environ.core :refer [env]]
            [clj-jwt.core :refer :all]))

(defn config
  []
  {:name            "firebase"
   :firebase-key    (env :authenticator-firebase-key)
   :firebase-domain (env :authenticator-firebase-domain)})

; Using 'firebase' authentication, anyone with a common social media account or
; email address is allowed to login, but by default their permissions are very
; limited.
(defn find-user
  [email-address & {:keys [first-name last-name]
                    :or {first-name nil
                         last-name nil}}]
  {:first-name    (or first-name
                      (.substring email-address
                                  0
                                  (.indexOf email-address
                                            "@")))
   :last-name     (or last-name "")
   :email-address email-address
   :is-admin      false})

(defn login
  [email-address auth-token]

  ; verify JSON web token information
  (let [jwt-token (-> (:fa auth-token) str->jwt)
        token-email (-> jwt-token :claims :email)
        token-name (-> jwt-token :claims :name)
        name-split (.split token-name " ")
        is-email-match? (= token-email email-address)]

    (if is-email-match?
      (find-user email-address
                 :first-name (first name-split)
                 :last-name (join " " (rest name-split)))
      nil)))

