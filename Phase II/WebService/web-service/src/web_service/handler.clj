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

; easy methods to handle not allowed and not implemented APIs
(defn- not-allowed
  [api-method]
  (status {:body (str api-method " not allowed")}
          403))
(defn- not-implemented
  [api-method]
  (status {:body (str api-method " not implemented")}
          405))

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
      (PUT "/" [] (not-allowed "Update-all access levels"))
      (POST "/" [description] (access-level-add description))
      (DELETE "/" [] (not-allowed "Delete-all access levels"))
      (context
        "/:description" [description]
        (defroutes document-routes
          (GET "/" [] (access-level-get description))
          (PUT "/" [] (not-implemented "Update access level"))
          (POST "/" [] (access-level-add description))
          (DELETE "/" [] (not-allowed "Delete access level"))))))

  (context
    "/users" []
    (defroutes document-routes
      (GET "/" {session :session} (user-list session))
      (PUT "/" [] (not-allowed "Update-all users"))
      (POST "/" [email_address] (user-register email_address))
      (DELETE "/" [] (not-allowed "Delete-all users"))
      (context
        "/:email-address" [email-address]
        (defroutes document-routes
          (GET "/" {session :session} (user-get session email-address))
          (PUT "/" [] (not-implemented "Update user"))
          (POST "/" [] (user-register email-address))
          (DELETE "/" [] (not-allowed "Delete user"))
          (context "/access" []
                   (defroutes document-routes
                     (GET "/" [] (user-access-list email-address))
                     (PUT "/" [] (not-implemented "User update-all access"))
                     (POST "/" [description] (user-access-add email-address description))
                     (DELETE "/" [] (not-allowed "User delete-all access"))))))))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (->
    (handler/site app-routes)
    (middleware/wrap-json-body)
    (middleware/wrap-json-response)))
