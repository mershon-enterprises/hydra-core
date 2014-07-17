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

; add the specified access level to the system
(defn access-level-add
  [description]
  (let
    [query "insert into public.user_access_level (description) values (?)"
     success (try (sql/execute! db [query description])
                  true
                  (catch Exception e
                    (println (.getMessage e))
                    false))]
    ; if we successfully created the access level, return a "created" status and
    ; invoke access-level-get
    ; otherwise, return a "conflict" status
    (if success
      (status (access-level-get description) 201)
      (status {:body "Access Level already exists"} 409))))

; list the access-levels in the database
(defn access-level-list
  []
  (response
    (sql/query
      db
      ["select * from public.user_access_level"]
      :row-fn :description)))
