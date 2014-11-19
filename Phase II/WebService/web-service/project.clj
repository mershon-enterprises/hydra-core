(defproject web-service "0.3.0-SNAPSHOT"
  :description "REST API for hydra-core"
  :url "slixbits.com"
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
                 ]
  :plugins [[lein-ring "0.8.11"]
            [lein-environ "1.0.0"]]
  :ring {:handler web-service.handler/app
         :init web-service.handler/init
         :destroy web-service.handler/destroy}
  :main web-service.core
  :profiles {:dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                                  [ring-mock "0.1.5"]]
                   :env {:database-credentials {:host     "localhost"
                                                :port     5432
                                                :db-name  "postgres"
                                                :schema   "public"
                                                :user     "postgres"
                                                :password "password"}
                         :ldap-credentials {:host         "localhost:3389"
                                            :bind-dn      "pic\\admin"
                                            :password     "adminpassword"}
                         :rabbitmq-credentials {:host     "localhost"
                                                :port     5672
                                                :username "guest"
                                                :password "guest"
                                                :vhost    "/"}}}
             :test {:env
                    {:database-credentials {:host     "localhost"
                                            :port     5432
                                            :db-name  "postgres"
                                            :schema   "public"
                                            :user     "postgres"
                                            :password "password"}
                     :ldap-credentials {:host         "testHost"
                                        :bind-dn      "testUser"
                                        :password     "testPassword"}
                     :rabbitmq-credentials {:host     "localhost"
                                            :port     5672
                                            :username "guest"
                                            :password "guest"
                                            :vhost    "/"}}}
             :prod {:env
                    {:database-credentials {:host     "hydra-database-core.clyhxhyl70jt.us-west-2.rds.amazonaws.com"
                                            :port     5432
                                            :db-name  "hydra"
                                            :schema   "public"
                                            :user     "postgres"
                                            :password "ph6qu7a4eMEzupre"}
                     :ldap-credentials {:host         "192.168.138.12"
                                        :bind-dn      "pic\\admin"
                                        :password     "adminpassword"}
                     :rabbitmq-credentials {:host     "172.31.27.248"
                                            :port     5672
                                            :username "guest"
                                            :password "guest"
                                            :vhost    "/"}}}})
