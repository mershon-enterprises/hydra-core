(ns web-service.handler
  (:use [ring.util.response]
        [web-service.user])
  (:require [compojure.core :refer :all]
            [compojure.handler :as handler]
            [ring.middleware.json :as middleware]
            [compojure.route :as route]
            [web-service.user :as user]))

; get the version of the API
(defn get-version
  []
  (response {:version "0.1.0"}))

(defroutes app-routes
  (GET "/version" [] (get-version))
  (GET "/user/list" [] (user-list))
  (POST "/user/register" [email_address] (user-register email_address))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (->
    (handler/site app-routes)
    (middleware/wrap-json-body)
    (middleware/wrap-json-response)))
