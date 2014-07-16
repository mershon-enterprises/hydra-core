(defproject web-service "0.1.0-SNAPSHOT"
  :description "REST API for hydra-core"
  :url "slixbits.com"
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/java.jdbc "0.3.4"]
                 [compojure "1.1.8"]
                 [ring/ring-json "0.3.1"]
                 [postgresql "9.3-1101.jdbc4"]
                 [org.clojure/data.json "0.2.5"]]
  :plugins [[lein-ring "0.8.11"]]
  :ring {:handler web-service.handler/app}
  :profiles
  {:dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                        [ring-mock "0.1.5"]]}})
