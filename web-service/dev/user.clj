(ns user
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

(defn mock-data
  ([num]
   (if (not-empty num)
     (do
       (println (str "Mocking" num "datasets..."))
       (dummy.datasets/mock-datasets num))))
  ([]
   (mock-data 500)))

(defn run
  []
  (try
    (shared-init/init)
    (catch Exception ex
      ; do nothing  
      nil))

  (println "if needed, use (mock-data <cnt>) function to generate mock data-sets.")

  (jetty/run-jetty handler/app {:port 3000
                                :configurator full-head-avoidance}))
