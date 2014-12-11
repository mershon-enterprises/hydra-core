(ns web-service.core
  (:use [web-service.handler])
  (:require [ring.adapter.jetty :as jetty]
            [dummy.datasets]))

; define a configurator function for the jetty web server so we can override the
; default maximum size of the POST header to be 8MB
(defn full-head-avoidance
  [jetty]
  (doseq [connector (.getConnectors jetty)]
    (.setRequestHeaderSize connector 8388608)))

(defn -main
  []

  (web-service.handler/init)

  ; mock 500 datasets
  (dummy.datasets/mock-datasets 500)

  (jetty/run-jetty web-service.handler/app {:port 3000
                                            :configurator full-head-avoidance}))