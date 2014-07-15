(ns web-service.session
  (:use [ring.util.response]))

; check if the logged-in user has a permission
(defn has-access
  [session access-level]
  (let [session-access (set (:access session))]
    (println (str "Testing if [" access-level
                  "] in " session-access))
    (contains? session-access access-level)))

; quick helper for access denied
(defn access-denied
  [access-level]
  (status {:body (str "Access Denied: requires ['" access-level "'] access")}
          401))
