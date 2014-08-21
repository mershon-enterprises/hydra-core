(ns web-service.smtp
  (:require [postal.core :as postal]))

(def server {:host "192.168.138.2"
             :port 25
             :user "pwt"
             :pass "44Red22"})

(defn send-message
  [email-address subject message]
  (postal/send-message server
                       {:from "no-reply@slixbits.com"
                        ; TODO -- uncomment when used in testing by client
                        :to "contact@slixbits.com"
                        ;:to email-address
                        :subject subject
                        :body message}))
