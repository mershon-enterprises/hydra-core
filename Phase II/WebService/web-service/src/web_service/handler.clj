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

  (POST "/user/access/add"
        [email_address access_level]
        (user-access-add email_address access_level))
  (GET "/user/access/list"
        [email_address]
       (user-access-list email_address))

  (context
    "/users" []
    (defroutes document-routes
      (GET "/" [] (user-list))
      (PUT "/" [] (status {:body "Update-all users not allowed"} 403))
      (POST "/" [email_address] (user-register email_address))
      (DELETE "/" [] (status {:body "Delete-all users not allowed"} 403))
      (context
        "/:email-address" [email-address]
        (defroutes document-routes
          (GET "/" [] (user-get email-address))
          (PUT "/" [] (status {:body "Update user not implemented"} 405))
          (POST "/" [] (user-register email-address))
          (DELETE "/" [] (status {:body "Delete user not allowed"} 403))))))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (->
    (handler/site app-routes)
    (middleware/wrap-json-body)
    (middleware/wrap-json-response)))
