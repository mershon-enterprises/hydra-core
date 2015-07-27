(ns web-service.core
  (:use [web-service.handler])
  (:require [ring.adapter.jetty :as jetty]
            [web-service.handler :as handler]
            [web-service.shared-init :as shared-init]
            [dummy.datasets]))

; define a configurator function for the jetty web server so we can override the
; default maximum size of the POST header to be 8MB
(defn full-head-avoidance
  [jetty]
  (doseq [connector (.getConnectors jetty)]
    (.setRequestHeaderSize connector 8388608)))

(defn -main
  [& args]
  (shared-init/init)

  ; mock 500 datasets
  (if (and (not (empty? args))
           (not= -1 (.indexOf args "--mock-data")))
    (do
      (println "Mocking 500 datasets...")
      (dummy.datasets/mock-datasets 500))
    (println "If needed, use '--mock-data' flag to generate mock data-sets."))

  (jetty/run-jetty handler/app {:port 3000
                                :configurator full-head-avoidance}))
