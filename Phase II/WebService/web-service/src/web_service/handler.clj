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

(defn get-version
  []
  (response {:version "0.1.0"}))

(defroutes app-routes
  (GET "/version" [] (get-version))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (->
    (handler/site app-routes)
    (middleware/wrap-json-body)
    (middleware/wrap-json-response))
  )
