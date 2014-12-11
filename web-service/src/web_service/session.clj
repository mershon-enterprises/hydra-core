(ns web-service.session
  (:use [ring.util.response]
        [web-service.db])
  (:require [clojure.java.jdbc :as sql]))


; quick helper for access denied
(defn access-denied
  [access-level]
  (status
    {:body
     {:response (str "Access Denied: requires ['" access-level "'] access")}}
    401))


; start a new session, and immediately end it
;
; the reason we end the session immediately is because a session is considered
; to still be active for up to 30 minutes but we don't want to leave the end
; date null forever
(defn start
  [email-address]

  (let [query (str "insert into public.user_session "
                   "(start_date, end_date, user_id) "
                   "values (now(), now(), "
                   "  (select id from public.user where email_address=?)"
                   ")")]
    (try (sql/execute! (db) [query email-address])
         true
         (catch Exception e
           (println (.getMessage e))
           false))))


; get the current session id
(defn- get-current-id
  [email-address]
  (let [get-query (str "select us.id from public.user_session us "
                       "inner join public.user u "
                       "  on u.id = us.user_id "
                       "where u.email_address=? "
                       "and ("
                       "  us.end_date is null"
                       "  or (now() - us.end_date) < interval '30 minutes'"
                       ")")
        update-query (str "update public.user_session "
                          "set end_date=now(), date_modified=now() "
                          "where id=?")
        get-current (fn []
                      (first (sql/query (db)
                                        [get-query email-address]
                                        :row-fn :id)))
        update-current (fn [current-id]
                         (try (sql/execute! (db) [update-query current-id])
                              (catch Exception e
                                (.printStackTrace e))))
        current-id (get-current)]

    ; if there isn't a current session, start one
    (if current-id
      (do
        (update-current current-id)
        current-id)
      (do
        (start email-address)
        (get-current)))))


; log some arbitrary detail about a session
(defn log-detail
  [email-address attribute value]
  (let [query (str "insert into public.user_session_detail "
                   "(attribute, value, session_id) values (?,?,?)")
        session-id (get-current-id email-address)]
    (try (sql/execute! (db) [query
                           attribute
                           value
                           (get-current-id email-address)])
         true
         (catch Exception e
           (.printStackTrace e)
           false))))
