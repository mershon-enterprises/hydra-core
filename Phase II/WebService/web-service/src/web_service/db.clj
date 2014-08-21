(ns web-service.db
  (:require [clojure.java.jdbc :as sql]))

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
