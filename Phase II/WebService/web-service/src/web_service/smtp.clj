(ns web-service.smtp
  (:require [postal.core :as postal]
            [environ.core :refer [env]]))

(def server (env :server))

(defn send-message
  [email-address subject message]
  (postal/send-message server
                       {:from "no-reply@slixbits.com"
                        ; TODO -- uncomment when used in testing by client
                        :to "contact@slixbits.com"
                        ;:to email-address
                        :subject subject
                        :body message}))
