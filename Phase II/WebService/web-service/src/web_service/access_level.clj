(ns web-service.access-level
  (:use [ring.util.response]
        [web-service.db])
  (:require [clojure.java.jdbc :as sql]
            [compojure.route :as route]))

; get the specified access level
(defn access-level-get
  [description]
  (let
    [query "select * from public.user_access_level where description=?"
     access-level (first (sql/query db [query description]))]
    (if access-level
      (response access-level)
      (not-found "Access Level not found"))))

; list the access-levels in the database
(defn access-level-list
  []
  (response
    (sql/query
      db
      ["select * from public.user_access_level"]
      :row-fn :description)))
