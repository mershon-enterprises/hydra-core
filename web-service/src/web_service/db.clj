(ns web-service.db
  (:require [clojure.java.jdbc :as sql]
            [environ.core :refer [env]])
  (:import com.mchange.v2.c3p0.ComboPooledDataSource))

(def db-spec {:classname   "org.postgresql.Driver"
              :subprotocol "postgresql"
              :subname     (str "//"
                                (env :db-host) ":"
                                (env :db-port) "/"
                                (env :db-name))
              ; Any additional keys are passed to the driver
              ; as driver-specific properties.
              :user        (env :db-user)
              :password    (env :db-password)})

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

(defn db [] @pooled-db)
