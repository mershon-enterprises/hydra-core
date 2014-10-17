(ns web-service.handler
  (:use [ring.util.response]
        [web-service.access-level]
        [web-service.authentication]
        [web-service.client]
        [web-service.data]
        [web-service.user])
  (:require [compojure.core :refer :all]
            [compojure.handler :as handler]
            [ring.middleware.json :as json]
            [compojure.route :as route]
            [web-service.amqp :as amqp]))

; get the version of the API
(defn get-version
  []
  (response {:version "0.2.0"}))

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
  (POST "/admin-authenticate" [email_address password user_email_address]
        (admin-authenticate email_address password user_email_address))
  (POST "/authenticate" [email_address password]
        (authenticate email_address password))
  (GET "/version" [] (get-version))

  (context
    "/access-levels" []
    (defroutes document-routes
      (GET "/" [api_token]
           (guard-with-user api_token access-level-list))
      (PUT "/" [] (not-allowed "Update-all access levels"))
      (POST "/" [] (not-allowed "Create access level"))
      (DELETE "/" [] (not-allowed "Delete-all access levels"))
      (context
        "/:description" [description]
        (defroutes document-routes
          (GET "/" [api_token]
               (guard-with-user api_token access-level-get description))
          (PUT "/" [] (not-allowed "Update access level"))
          (POST "/" [] (not-allowed "Create access level"))
          (DELETE "/" [] (not-allowed "Delete access level"))))))

  (context
    "/clients" []
    (defroutes document-routes
      (GET "/" [api_token]
           (guard-with-user api_token client-list))
      (PUT "/" [] (not-allowed "Update-all clients"))
      (POST "/" [api_token name]
            (guard-with-user api_token client-register name))
      (DELETE "/" [] (not-allowed "Delete-all clients"))
      (context
        "/:name" [name]
        (defroutes document-routes
          (GET "/" [api_token]
               (guard-with-user api_token client-get name))
          (PUT "/" [] (not-implemented "Update client"))
          (POST "/" [api_token]
                (guard-with-user api_token client-register name))
          (DELETE "/" [] (not-allowed "Delete client"))
          (context
            "/locations" []
            (defroutes document-routes
              (GET "/" [api_token]
                   (guard-with-user api_token client-location-list name))
              (PUT "/" [] (not-allowed "Client update-all locations"))
              (POST "/" [api_token description]
                    (guard-with-user
                      api_token client-location-add name description))
              (DELETE "/" [] (not-allowed "Client delete-all locations"))))))))

  (context
    "/data" []
    (defroutes document-routes
      (GET "/" [api_token]
           (guard-with-user api_token data-list))
      (PUT "/" [] (not-allowed "Update-all data"))
      (POST "/" [api_token uuid date_created created_by data]
            (guard-with-user api_token
                             data-submit
                             uuid
                             date_created
                             created_by
                             data))
      (DELETE "/" [] (not-allowed "Delete-all data"))
      (context
        "/:uuid" [uuid]
        (defroutes document-routes
          (GET "/" [api_token]
               (guard-with-user api_token data-get uuid))
          (PUT "/" [] (not-implemented "Update data"))
          (POST "/" [api_token date_created created_by data]
                (guard-with-user api_token
                                 data-submit
                                 uuid
                                 date_created
                                 created_by
                                 data))
          (DELETE "/" [api_token]
                  (guard-with-user api_token data-delete uuid))
          (context
            "/:filename" [filename]
            (defroutes document-routes
              (GET "/" [api_token]
                   (guard-file-with-user api_token
                                         data-get-attachment
                                         uuid
                                         filename))
              (PUT "/" [] (not-implemented "Update data attachment"))
              (POST "/" [] (not-implemented "Submit data attachment"))
              (DELETE "/" [] (not-implemented "Delete data attachment"))))))))

  (context
    "/users" []
    (defroutes document-routes
      (GET "/" [api_token]
           (guard-with-user api_token user-list))
      (PUT "/" [] (not-allowed "Update-all users"))
      (POST "/" [] (not-allowed "Register user"))
      (DELETE "/" [] (not-allowed "Delete-all users"))
      (context
        "/:email-address" [email-address]
        (defroutes document-routes
          (GET "/" [api_token]
               (guard-with-user api_token user-get email-address))
          (PUT "/" [] (not-implemented "Update user"))
          (POST "/" [] (not-allowed "Register user"))
          (DELETE "/" [] (not-allowed "Delete user"))
          (context
            "/access" []
            (defroutes document-routes
              (GET "/" [api_token]
                   (guard-with-user api_token user-access-list email-address))
              (PUT "/" [] (not-implemented "User update-all access"))
              (POST "/" [api_token description]
                    (guard-with-user api_token
                                     user-access-add
                                     email-address
                                     description))
              (DELETE "/" [] (not-allowed "User delete-all access"))))))))
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
    (handler/site app-routes)
    (json/wrap-json-body)
    (json/wrap-json-response)))
