(defproject well-test-identifier "0.1.0-SNAPSHOT"
  :description "Well Test Identifier"
  :url "slixbits.com"
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [com.novemberain/langohr "3.0.0-rc2"]  ; AMQP rabbitmq library
                 [cheshire "5.3.1"]                     ; json encoding library
                                                        ;   including dates
                 [environ "1.0.0"]                      ; environment-based
                                                        ;   configuration
                 [org.clojure/data.codec "0.1.0"]       ; base64 codec
                 [clj-time "0.8.0"]                     ; time helpers and
                                                        ;   formatters
                 [com.draines/postal "1.11.1"]          ; smtp email library
                 ]
  :plugins [[lein-environ "1.0.0"]]
  :main well-test-identifier.core
  :profiles {:dev {:env {:rabbitmq-host      "localhost"
                         :rabbitmq-username  "guest"
                         :rabbitmq-password  "guest"
                         :smtp-host          "localhost"
                         :smtp-port          2525
                         :smtp-username      "pwt"
                         :smtp-password      "44Red22"
                         :smtp-to-address    "kevin@slixbits.com"}}
             :test {:env {:rabbitmq-host     "localhost"
                          :rabbitmq-username "guest"
                          :rabbitmq-password "guest"
                          :smtp-host         "localhost"
                          :smtp-port         2525
                          :smtp-username     "pwt"
                          :smtp-password     "44Red22"
                          :smtp-to-address   "kevin@slixbits.com"}}})
