(defproject web-service "0.7.0-SNAPSHOT"
  :description "REST API for hydra-core"
  :url "mershon.enterprises"
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/java.jdbc "0.3.4"]
                 [compojure "1.1.8"]
                 [ring/ring-core "1.2.1"]
                 [ring/ring-jetty-adapter "1.2.1"]      ; dev HTTP server
                                                        ;   configuration
                 [ring/ring-json "0.3.1"]               ; JSON response wrapping
                 [postgresql "9.3-1101.jdbc4"]          ; database
                 [org.clojars.pntblnk/clj-ldap "0.0.9"] ; ldap integration
                 [org.clojure/tools.logging "0.3.0"]
                 [crypto-password "0.1.3"]              ; hashing/crypto support
                                                        ;   for API tokens
                 [environ "1.0.0"]                      ; environment-based
                                                        ;   configuration
                 [com.mchange/c3p0 "0.9.2.1"]           ; connection pooling
                 [com.novemberain/langohr "3.0.0-rc2"]  ; AMQP rabbitmq library
                 [cheshire "5.3.1"]                     ; json encoding library
                                                        ;   including dates
                 [org.clojure/data.generators "0.1.2"]  ; random data generators
                                                        ;   used for mocking
                 [org.clojure/data.codec "0.1.0"]       ; base64 codec
                 [com.lispcast/org.apache.commons.lang "2.5.0"] ; random strings
                 [org.liquibase/liquibase-core "3.3.3"] ; database versioning
                 [postgresql "9.3-1102.jdbc4"]          ; postgres jdbc driver
                 ]

  :plugins [[lein-ring "0.8.11"]
            [lein-environ "1.0.0"]]
  :ring {:handler web-service.handler/app
         :init web-service.handler/init
         :war-exclusions []                             ; don't exclude hidden
                                                        ;   files from WARs
         :destroy web-service.handler/destroy}
  :main web-service.core
  :profiles {
             ; override 'dev' settings in ~/.lein/profiles.clj

             :test {:dependencies [[ring-mock "0.1.5"]]
                    :env
                    {:db-host           "localhost"
                     :db-port           5432
                     :db-name           "postgres"
                     :db-user           "postgres"
                     :db-password       "password"
                     :authenticator     "match"
                     :rabbitmq-host     "localhost"
                     :rabbitmq-username "guest"
                     :rabbitmq-password "guest"}}})
