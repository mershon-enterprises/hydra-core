(ns web-service.session
  (:use [ring.util.response])
  (:require [web-service.schema :as queries :include-macros true]))


; quick helper for access denied
(defn access-denied
  [access-level]
  (status
    {:body
     {:response (str "Access Denied: requires ['" access-level "'] access")}}
    403))


; start a new session, and immediately end it
;
; the reason we end the session immediately is because a session is considered
; to still be active for up to 30 minutes but we don't want to leave the end
; date null forever
(defn start
  [email-address]

  (try (queries/session-start! {:email_address email-address} {})
       true
       (catch Exception e
         false)))


; get the current session id
(defn- get-current-id
  [email-address]
  (let [get-current (fn [] (queries/session-get-current {:email_address email-address}
                                                        {:result-set-fn (comp :id first)}))
        current-id (get-current)]

    ; if there isn't a current session, start one
    (if current-id
      (do
        (queries/session-update! {:session_id current-id} {})
        current-id)
      (do
        (start email-address)
        (get-current)))))


; log some arbitrary detail about a session
(defn log-detail
  [email-address attribute value]
  (let [session-id (get-current-id email-address)]
    (try (queries/session-log-detail! {:attribute attribute
                                       :value     value
                                       :session_id (get-current-id email-address)}
                                      {})
         true
         (catch Exception e
           false))))
