(ns hydra.routes.authenticator
  (:use [ring.util.response])
  (:require [compojure.core :refer :all]

            [web-service.authentication :refer [authenticator-config]]))

(defn get-authenticator
  []
  (response (authenticator-config)))

(def authenticator-routes
  (GET "/authenticator" [] (get-authenticator)))
