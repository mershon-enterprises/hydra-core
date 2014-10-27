(ns web-service.db
  (:require [clojure.java.jdbc :as sql])
  (:import com.mchange.v2.c3p0.ComboPooledDataSource))

(let [db-host "localhost"
      db-port 11001
      db-name "postgres"
      db-schema "public"]

  (def db-spec {:classname "org.postgresql.Driver"
                :subprotocol "postgresql"
                :subname  (str "//" db-host ":" db-port "/" db-name)
                ; Any additional keys are passed to the driver
                ; as driver-specific properties.
                :user "postgres"
                :password "password"})

  (defn pool
    [spec]
    (let [cpds (doto (ComboPooledDataSource.)
                 (.setDriverClass (:classname spec))
                 (.setJdbcUrl (str "jdbc:" (:subprotocol spec) ":" (:subname spec)))
                 (.setUser (:user spec))
                 (.setPassword (:password spec))
                 ;; expire excess connections after 30 minutes of inactivity:
                 (.setMaxIdleTimeExcessConnections (* 30 60))
                 ;; expire connections after 3 hours of inactivity:
                 (.setMaxIdleTime (* 3 60 60)))]
      {:datasource cpds}))

  (def pooled-db (delay (pool db-spec)))

  (defn db [] @pooled-db))
