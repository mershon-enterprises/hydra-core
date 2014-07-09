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
(defn users-list
  [db-connection (sql/get-connection db)]
  (response
    (sql/with-db-transaction db-connection db
      (sql/query db
                 [ "select * from public.user"]
                 :row-fn :email_address)
      )
    )
)

(defroutes app-routes
  (GET "/version" [] (get-version))
  (GET "/user/list" [] (users-list))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (->
    (handler/site app-routes)
    (middleware/wrap-json-body)
    (middleware/wrap-json-response)))
