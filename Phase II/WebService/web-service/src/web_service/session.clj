(ns web-service.session
  (:use [ring.util.response]))

; check if the logged-in user has the specified access level associated with
; their account
(defn has-access
  [session access-level]
  (let [session-access (set (:access session))]
    (contains? session-access access-level)))

; quick helper for access denied
(defn access-denied
  [access-level]
  (status {:body (str "Access Denied: requires ['" access-level "'] access")}
          401))
