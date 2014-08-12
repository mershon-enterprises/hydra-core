(ns web-service.access-level
  (:use [ring.util.response]
        [web-service.db]
        [web-service.session])
  (:require [clojure.java.jdbc :as sql]
            [web-service.constants :as constants]))

; get the specified access level
(defn access-level-get
  [description]

  ; FIXME log the activity to the session
  ; (log-detail session
  ;             constants/session-activity
  ;             (str constants/session-get-access-level " " description))

  (let
    [query "select * from public.user_access_level where description=?"
     access-level (first (sql/query db [query description]))]
    (if access-level
      (response {:response access-level})
      (not-found "Access Level not found"))))

; list the access-levels in the database
(defn access-level-list
  []

  ; FIXME log the activity to the session
  ; (log-detail session
  ;             constants/session-activity
  ;             constants/session-list-access-levels)

  (response {:response (sql/query db
                                  ["select * from public.user_access_level"]
                                  :row-fn :description)})
  )
