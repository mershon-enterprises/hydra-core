(ns web-service.authentication.persona
  (:require [clj-http.client :as client]
            [cheshire.core :refer :all]
            [environ.core :refer [env]]))

(defn config
  []
  {:name "persona"})

; Using 'persona' authentication, anyone with a Mozilla Persona account is
; allowed to login, but by default their permissions are very limited.
(defn find-user
  [email-address]
  {:first-name    (.substring email-address
                              0
                              (.indexOf email-address
                                        "@"))
   :last-name     ""
   :email-address email-address
   :is-admin      false})

(defn login
  [_ignore assertion]

  (let [{body :body}
        (client/post "https://verifier.login.persona.org/verify"
                     {:form-params
                      {:assertion assertion
                       :audience  (env :authenticator-host)}
                      :content-type :json})

        {email-address :email
         status        :status}
        (parse-string body true)]

    (if (= "okay" status)
      (find-user email-address)
      nil)))
