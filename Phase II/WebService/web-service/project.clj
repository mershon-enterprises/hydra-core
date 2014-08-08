(defproject web-service "0.1.0-SNAPSHOT"
  :description "REST API for hydra-core"
  :url "slixbits.com"
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/java.jdbc "0.3.4"]
                 [compojure "1.1.8"]
                 [ring/ring-json "0.3.1"]
                 [postgresql "9.3-1101.jdbc4"]
                 [org.clojure/data.json "0.2.5"]
                 [org.clojars.pntblnk/clj-ldap "0.0.9"]
                 [org.clojure/tools.logging "0.3.0"]
                 [com.draines/postal "1.11.1"]
                 [crypto-random "1.2.0"]]
  :plugins [[lein-ring "0.8.11"]]
  :ring {:handler web-service.handler/app}
  :profiles
  {:dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                        [ring-mock "0.1.5"]]}})
