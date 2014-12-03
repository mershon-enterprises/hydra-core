(ns well-test-identifier.handler
  (:use [ring.util.response])
  (:require [compojure.core :refer :all]
            [compojure.handler :as handler]
            [compojure.route :as route]
            [well-test-identifier.amqp :as amqp]))

(defroutes app-routes
  (GET "/" [] (redirect "http://hydra.slixbits.com"))
  (route/resources "/")
  (route/not-found "Not Found"))

(defn init
  []
  ; start the AMQP connection
  (amqp/connect))

(defn destroy
  []
  ; shutdown the AMQP connection
  (amqp/disconnect))

(def app
  (->
    (handler/site app-routes)))
