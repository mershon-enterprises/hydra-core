(ns web-service.schema
  (:import (java.sql DriverManager)
           (liquibase Liquibase)
           (liquibase.database DatabaseFactory)
           (liquibase.database.jvm JdbcConnection)
           (liquibase.resource FileSystemResourceAccessor))
  (:require [clojure.java.io :as io]
            [clojure.tools.logging :as log]
            [environ.core :refer [env]]
            [yesql.core :refer [defqueries]]))

(def db-spec {:classname   "org.postgresql.Driver"
              :subprotocol "postgresql"
              :subname     (str "//" (env :db-host)
                                ":"  (env :db-port)
                                "/"  (env :db-name))
              :user        (env :db-user)
              :password    (env :db-password)})

(defqueries "queries/access_level.sql"    {:connection db-spec})
(defqueries "queries/dataset.sql"         {:connection db-spec})
(defqueries "queries/session.sql"         {:connection db-spec})
(defqueries "queries/user.sql"            {:connection db-spec})
(defqueries "queries/client_metadata.sql" {:connection db-spec})

(defn- liquibase-instance
  "Generate liquibase instance using environment variables."
  []

  ; tell Java to load the postgresql driver on the classpath
  (Class/forName "org.postgresql.Driver")

  (let [c (DriverManager/getConnection (str "jdbc:postgresql:"
                                            "//"  (env :db-host)
                                            ":"   (env :db-port)
                                            "/"   (env :db-name))
                                       (env :db-user)
                                       (env :db-password))
        connection (new JdbcConnection c)
        instance (DatabaseFactory/getInstance)
        database (.findCorrectDatabaseImplementation instance connection)
        fsra (new FileSystemResourceAccessor)
        changelogs (-> (io/resource "private/database/changelog.xml")
                       (io/file)
                       (.getAbsolutePath))]
    (new Liquibase changelogs fsra database)))

(defn update
  "Build/update database using liquibase changelogs context"
  []
  (log/info "Applying new liquibase changelogs to database if they exist.")
  (.update (liquibase-instance) nil))

#_(defqueries "queries/client_metadata.sql" {:connection db-spec})
#_(add-client-metadata<! {:email_address "cristopher@mershonenterprises.com" 
                          :client_name "MEC"
                          :key_name "this_key3"
                          :key_value "this_value3"})

#_(defqueries "queries/client_metadata.sql" {:connection db-spec})
#_(get-client-metadata-list {:client_name "MEC"})

