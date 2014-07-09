(ns web-service.handler
  (:use ring.util.response)
  (:require [compojure.core :refer :all]
            [compojure.handler :as handler]
            [ring.middleware.json :as middleware]
            [clojure.java.jdbc :as sql]
            [compojure.route :as route]))

(let [db-host "localhost"
      db-port 5432
      db-name "postgres"
      db-schema "public"]

  (def db {:classname "org.postgresql.Driver"
           :subprotocol "postgresql"
           :subname  (str "//" db-host ":" db-port "/" db-name)
           ; Any additional keys are passed to the driver
           ; as driver-specific properties.
           :user "postgres"
           :password "password"}))

; get the version of the API
(defn get-version
  []
  (response {:version "0.1.0"}))


; list the users in the database
(defn user-list
  []
  (response
    {:emails
     (sql/query
       db
       ["select * from public.user"]
       :row-fn :email_address)}))

; register a user by username
(defn user-register
  [email_address]
  (response
    {:success
     (try
       (sql/execute!
         db
         ["insert into public.user (email_address) values (?)" email_address])
       true
       (catch Exception e
         false))}))

(defroutes app-routes
  (GET "/version" [] (get-version))
  (GET "/user/list" [] (user-list))
  (GET "/user/register" [email_address] (user-register email_address))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (->
    (handler/site app-routes)
    (middleware/wrap-json-body)
    (middleware/wrap-json-response)))
