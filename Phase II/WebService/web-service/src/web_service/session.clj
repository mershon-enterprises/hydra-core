(ns web-service.session
  (:use [ring.util.response]
        [web-service.db])
  (:require [clojure.java.jdbc :as sql]))

; check if the logged-in user has the specified access level associated with
; their account
(defn has-access
  [session access-level]
  (let [session-access (set (:access session))]
    (contains? session-access access-level)))

; quick helper for access denied
(defn access-denied
  [access-level]
  (status
    {:body
     {:response (str "Access Denied: requires ['" access-level "'] access")}}
    401))


; get the current session id
(defn- get-current-id
  [session]
  (let [query (str "select us.id from public.user_session us "
                   "inner join public.user u "
                   "  on u.id = us.user_id "
                   "where us.end_date is null and u.email_address=?")]
    (first (sql/query db [query (:email-address session)] :row-fn :id))))


; log some arbitrary detail about a session
(defn log-detail
  [session attribute value]
  (let [query (str "insert into public.user_session_detail "
                   "(attribute, value, session_id) values (?,?,?)")
        session-id (get-current-id session)]
    (try (sql/execute! db [query attribute value (get-current-id session)])
         true
         (catch Exception e
           (.printStackTrace e)
           false))))


; start a new session
(defn start
  [email-address]

  ; now, start a new session
  (let [query (str "insert into public.user_session (start_date, user_id) "
                   "values (now(), "
                   "  (select id from public.user where email_address=?)"
                   ")")]
    (try (sql/execute! db [query email-address])
         true
         (catch Exception e
           (println (.getMessage e))
           false))))
