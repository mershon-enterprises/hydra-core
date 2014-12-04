(ns well-test-identifier.handler
  (:use [ring.util.response])
  (:require [compojure.core :refer :all]
            [compojure.handler :as handler]
            [compojure.route :as route]
            [well-test-identifier.shared-init :as shared-init]))

(defroutes app-routes
  (GET "/" [] (redirect "http://hydra.slixbits.com"))
  (route/resources "/")
  (route/not-found "Not Found"))

(defn init
  []
  ; start the AMQP connection
  (shared-init/init))

(defn destroy
  []
  ; shutdown the AMQP connection
  (shared-init/destroy))

(def app
  (->
    (handler/site app-routes)))
