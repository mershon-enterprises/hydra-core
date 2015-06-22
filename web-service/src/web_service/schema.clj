(ns web-service.schema
  (:import (java.sql DriverManager)
           (liquibase Liquibase)
           (liquibase.database DatabaseFactory)
           (liquibase.database.jvm JdbcConnection)
           (liquibase.resource FileSystemResourceAccessor))
  (:require [clojure.tools.logging :as log]
            [environ.core :refer [env]]))

(def ^:private liquibase-instance
  "Generate liquibase instance using environment variables."
  (let[c (DriverManager/getConnection (str "jdbc:postgresql:"
                                           "//"  (env :db-host)
                                           ":"   (env :db-port)
                                           "/"   (env :db-name))
                                      (env :db-user)
                                      (env :db-password))
       connection (new JdbcConnection c)
       instance (DatabaseFactory/getInstance)
       database (.findCorrectDatabaseImplementation instance connection)
       fsra (new FileSystemResourceAccessor)]
    (new Liquibase "../database/changelog.xml" fsra database)))

(defn update
  "Build/update database using liquibase changelogs context"
  []
  (log/info "Applying new liquibase changelogs to database if they exist.")
  (.update liquibase-instance nil))

