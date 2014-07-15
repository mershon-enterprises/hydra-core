(ns web-service.handler
  (:use [ring.util.response]
        [web-service.access-level]
        [web-service.authentication]
        [web-service.user])
  (:require [compojure.core :refer :all]
            [compojure.handler :as handler]
            [ring.middleware.json :as middleware]
            [ring.middleware.session :as session]
            [compojure.route :as route]))

; get the version of the API
(defn get-version
  []
  (response {:version "0.1.0"}))

(defroutes app-routes
  (POST "/login" {session :session
                  params :params}
        (let [email-address (:email_address params)
              password (:password params)]

          (login session email-address password)))
  (POST "/logout" [] (logout))
  (GET "/version" [] (get-version))

  (context
    "/access-levels" []
    (defroutes document-routes
      (GET "/" [] (access-level-list))
      (PUT "/" [] (status {:body "Update-all access levels not allowed"} 403))
      (POST "/" [description] (access-level-add description))
      (DELETE "/" [] (status {:body "Delete-all access levels not allowed"} 403))
      (context
        "/:description" [description]
        (defroutes document-routes
          (GET "/" [] (access-level-get description))
          (PUT "/" [] (status {:body "Update access level not implemented"} 405))
          (POST "/" [] (access-level-add description))
          (DELETE "/" [] (status {:body "Delete access level not allowed"} 403))))))

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
          (DELETE "/" [] (status {:body "Delete user not allowed"} 403))
          (context "/access" []
                   (defroutes document-routes
                     (GET "/" [] (user-access-list email-address))
                     (PUT "/" [] (status {:body "User Update-all access not implemented"} 405))
                     (POST "/" [description] (user-access-add email-address description))
                     (DELETE "/" [] (status {:body "User Delete-all access not allowed"} 403))))))))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (->
    (handler/site app-routes)
    (middleware/wrap-json-body)
    (middleware/wrap-json-response)))
