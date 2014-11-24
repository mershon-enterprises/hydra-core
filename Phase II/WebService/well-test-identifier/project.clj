(defproject well-test-identifier "0.1.0-SNAPSHOT"
  :description "Well Test Identifier"
  :url "slixbits.com"
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [com.novemberain/langohr "3.0.0-rc2"]  ; AMQP rabbitmq library
                 [cheshire "5.3.1"]                     ; json encoding library
                                                        ;   including dates
                 [environ "1.0.0"]                      ; environment-based
                                                        ;   configuration
                 ]
  :main well-test-identifier.core
  :profiles {:dev {:env {:rabbitmq-host      "localhost"
                         :rabbitmq-username  "guest"
                         :rabbitmq-password  "guest"}}
             :test {:env {:rabbitmq-host     "localhost"
                          :rabbitmq-username "guest"
                          :rabbitmq-password "guest"}}})
