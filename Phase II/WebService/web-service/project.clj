(defproject web-service "0.2.0-SNAPSHOT"
  :description "REST API for hydra-core"
  :url "slixbits.com"
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/java.jdbc "0.3.4"]
                 [compojure "1.1.8"]
                 [ring/ring-core "1.2.1"]
                 [ring/ring-jetty-adapter "1.2.1"]
                 [ring/ring-json "0.3.1"]
                 [postgresql "9.3-1101.jdbc4"]
                 [org.clojure/data.json "0.2.5"]
                 [org.clojars.pntblnk/clj-ldap "0.0.9"]
                 [org.clojure/tools.logging "0.3.0"]
                 [crypto-password "0.1.3"]
                 [environ "1.0.0"]
                 [com.mchange/c3p0 "0.9.2.1"]
                 [com.novemberain/langohr "3.0.0-rc2"]]
  :plugins [[lein-ring "0.8.11"]
            [lein-environ "1.0.0"]]
  :ring {:handler web-service.handler/app}
  :main web-service.core
  :profiles
  {:dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                        [ring-mock "0.1.5"]]
         :env {:ldap-credentials {
                    :host "localhost:3389"
                    :bind-dn "pic\\admin"
                    :password "adminpassword"}}}})
