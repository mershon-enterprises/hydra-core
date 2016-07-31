(ns web-service.access-level
  (:use [ring.util.response]
        [web-service.session])
  (:require [web-service.constants :as constants]
            [web-service.schema :as queries :include-macros true]))

(defn access-level-get
  "get the specified access level"
  [email-address description]

  ; log the activity to the session
  (log-detail email-address
              constants/session-activity
              (str constants/session-get-access-level " " description))

  (if-let [access-level (queries/get-access-level {:description description}
                                                  {:result-set-fn (comp first)})]
    (response {:response access-level})
    (not-found "Access Level not found")))

(defn access-level-list
  "list the access-levels in the database"
  [email-address]

  ; log the activity to the session
  (log-detail email-address
              constants/session-activity
              constants/session-list-access-levels)

  (response {:response (queries/list-access-levels {} {:row-fn :description})}))
