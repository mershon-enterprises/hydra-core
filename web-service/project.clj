(defproject web-service "0.7.3-SNAPSHOT"
  :description "REST API for hydra-core"
  :url "mershon.enterprises"
  :dependencies [[org.clojure/clojure "1.9.0-alpha15" :exclusions [core.async]]
                 [org.clojure/core.async "0.3.442"]
                 [org.clojure/java.jdbc "0.3.4"]
                 [ring "1.4.0"]
                 [ring/ring-defaults "0.2.0"]
                 [ring/ring-json "0.4.0"]               ; JSON response wrapping
                 [ring/ring-jetty-adapter "1.2.1"]      ; dev HTTP server
                                                        ;   configuration
                 [jumblerg/ring.middleware.cors "1.0.1"] ; cross-origin support
                 [compojure "1.5.0"]
                 [postgresql "9.3-1102.jdbc4"]          ; postgres jdbc driver
                 [org.clojars.pntblnk/clj-ldap "0.0.9"] ; ldap integration
                 [org.clojure/tools.logging "0.3.0"]
                 [crypto-password "0.1.3"]              ; hashing/crypto support
                                                        ;   for API tokens
                 [environ "1.1.0"]                      ; environment-based
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
                 [clj-http "2.0.0"]

                 [yesql "0.5.2"]

                 [clj-jwt "0.1.1"]]                      ; clojure JSON webtokens


  :plugins [[lein-ring "0.11.0"]
            [lein-environ "1.0.3"]]

  :source-paths ["src"]

  :ring {:handler web-service.handler/app
         :init web-service.handler/init
         :war-exclusions []                             ; don't exclude hidden
                                                        ;   files from WARs
         :destroy web-service.handler/destroy}

  :repl-options {:init-ns user}

  :profiles {:dev {:env {:db-host             "localhost"
                         :db-port             5432
                         :db-user             "postgres"
                         :db-password         "password"

                         ; Hydra Process Instruments
                         :db-name             "hydra"

                         :authenticator       "match"

                         ;:authenticator      "firebase"
                         ;:authenticator-firebase-key "firebase-key"
                         ;:authenticator-firebase-domain "firebase-domain"

                         ;:authenticator      "persona"
                         ;:authenticator-host "http://localhost:3000"

                         ;:authenticator      "ldap"
                         ;:ldap-domain        "domain"
                         ;:ldap-host          "host"
                         ;:ldap-bind-dn       "domain"
                         ;:ldap-password      "password"


                         :rabbitmq-host       "localhost"
                         :rabbitmq-username   "guest"
                         :rabbitmq-password   "guest"}
                   :plugins [[com.jakemccrary/lein-test-refresh "0.19.0"]]
                   :source-paths ["dev" "src"]}

                 :test {:dependencies [[ring-mock "0.1.5"]]
                        :env {:db-host            "localhost"
                              :db-port            5432
                              :db-name            "postgres"
                              :db-user            "postgres"
                              :db-password        "password"
                              :authenticator      "match"
                              :authenticator-host "http://localhost:3000"
                              :rabbitmq-host      "localhost"
                              :rabbitmq-username  "guest"
                              :rabbitmq-password  "guest"}}})
