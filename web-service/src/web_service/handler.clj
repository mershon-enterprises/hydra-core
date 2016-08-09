(ns web-service.handler
  (:use [ring.util.response]

        [web-service.authentication]
        [web-service.client]
        [web-service.data]
        [web-service.user])
  (:require [compojure.core :refer :all]
            [compojure.handler :as handler]
            [ring.middleware.json :as json]
            [ring.middleware.cors :refer [wrap-cors]]
            [compojure.route :as route]
            [environ.core :refer [env]]
            [web-service.shared-init :as shared-init]

            [hydra.access-level :refer [not-allowed]]

            [hydra.routes.access-level :as access-level]
            [hydra.routes.authenticator :as authenticator]
            [hydra.routes.version :as version]))

; easy methods to handle not allowed and not implemented APIs
(defn- not-implemented
  [api-method]
  (status {:body (str api-method " not implemented")}
          405))

(defroutes app-routes
  (GET "/" [] (header (resource-response "index.html" {:root "public"})
                      "Content-Type"
                      "text/html"))
  (POST "/admin-authenticate" [client_uuid email_address password user_email_address]
        (admin-authenticate client_uuid email_address password user_email_address))
  (POST "/authenticate" [client_uuid email_address password]
        (authenticate client_uuid email_address password))

  access-level/access-level-routes
  authenticator/authenticator-routes
  version/version-routes


  (context
    "/clients" []
    (defroutes document-routes
      (GET "/" [api_token client_uuid]
           (guard-with-user api_token client_uuid client-list))
      (PUT "/" [] (not-allowed "Update-all clients"))
      (POST "/" [api_token client_uuid name]
            (guard-with-user api_token client_uuid client-register name))
      (DELETE "/" [] (not-allowed "Delete-all clients"))
      (context
        "/:name" [name]
        (defroutes document-routes
          (GET "/" [api_token client_uuid]
               (guard-with-user api_token client_uuid client-get name))
          (PUT "/" [] (not-implemented "Update client"))
          (POST "/" [api_token client_uuid]
                (guard-with-user api_token client_uuid client-register name))
          (DELETE "/" [] (not-allowed "Delete client"))
          (context
            "/locations" []
            (defroutes document-routes
              (GET "/" [api_token client_uuid]
                   (guard-with-user api_token client_uuid client-location-list name))
              (PUT "/" [] (not-allowed "Client update-all locations"))
              (POST "/" [api_token client_uuid description]
                    (guard-with-user
                      api_token client_uuid client-location-add name description))
              (DELETE "/" [] (not-allowed "Client delete-all locations"))))))))

  (context
    "/data" []
    (defroutes document-routes
      (GET "/" [api_token client_uuid search_params]
           (guard-with-user api_token client_uuid data-set-list search_params))
      (PUT "/" [] (not-allowed "Update-all data"))
      (POST "/" [api_token client_uuid uuid date_created created_by data]
            (guard-with-user api_token
                             client_uuid
                             data-set-submit
                             uuid
                             date_created
                             created_by
                             data))
      (DELETE "/" [] (not-allowed "Delete-all data"))
      (context
        "/:uuid" [uuid]
        (defroutes document-routes
          (GET "/" [api_token client_uuid]
               (guard-with-user api_token client_uuid data-set-get uuid))
          (PUT "/" [] (not-implemented "Update data"))
          (POST "/" [api_token client_uuid date_created created_by data]
                (guard-with-user api_token
                                 client_uuid
                                 data-set-submit
                                 uuid
                                 date_created
                                 created_by
                                 data))
          (DELETE "/" [api_token client_uuid]
                  (guard-with-user api_token client_uuid data-set-delete uuid))
          (POST "/submit-tag" [api_token client_uuid type description value]
                (guard-with-user
                  api_token
                  client_uuid
                  data-set-primitive-submit
                  uuid
                  type
                  description
                  value))
          (DELETE "/delete-tag" [api_token client_uuid type description]
                  (guard-with-user
                    api_token
                    client_uuid
                    data-set-primitive-delete
                    uuid
                    type
                    description))
          (context
            "/:filename" [filename]
            (defroutes document-routes
              (GET "/" [api_token client_uuid]
                   (guard-file-with-user api_token
                                         client_uuid
                                         data-set-attachment-get
                                         uuid
                                         filename))
              (GET "/info" [api_token client_uuid]
                   (guard-with-user api_token
                                         client_uuid
                                         data-set-attachment-info-get
                                         uuid
                                         filename))
              (GET "/sharable-link" [api_token client_uuid exp_date end_point_url]
                   (guard-with-user api_token
                                    client_uuid
                                    data-set-attachment-sharable-download-link
                                    uuid
                                    filename
                                    exp_date
                                    end_point_url))
              (PUT "/" [api_token client_uuid new_filename]
                   (guard-with-user api_token
                                    client_uuid
                                    data-set-attachment-filename-rename
                                    uuid
                                    filename
                                    new_filename))
              (PUT "/replace" [api_token client_uuid new_contents]
                   (guard-with-user api_token
                                    client_uuid
                                    data-set-attachment-file-replace
                                    uuid
                                    filename
                                    new_contents))
                            (POST "/" [] (not-implemented "Submit data attachment"))
              (DELETE "/" [api_token client_uuid]
                      (guard-with-user api_token
                                       client_uuid
                                       data-set-attachment-delete
                                       uuid filename))
              (context
                "/sharing" []
                (defroutes document-routes
                  (GET "/" [api_token client_uuid]
                       (guard-with-user api_token
                                        client_uuid
                                        data-set-attachment-shared-access-info
                                        uuid
                                        filename))
                  (POST "/" [api_token client_uuid start_date exp_date user_email_list]
                       (guard-with-user api_token
                                        client_uuid
                                        data-set-attachment-sharing
                                        uuid
                                        filename
                                        start_date
                                        exp_date
                                        user_email_list))
                  (PUT "/" [api_token client_uuid user_email_list]
                       (guard-with-user api_token
                                        client_uuid
                                        data-set-attachment-shared-access-user-update
                                        uuid
                                        filename
                                        user_email_list))
                  (DELETE "/" [api_token client_uuid]
                          (guard-with-user api_token
                                           client_uuid
                                           data-set-attachment-shared-access-delete
                                           uuid
                                           filename))))))))))
  (context
    "/attachments" []
      (defroutes document-routes
        (GET "/" [api_token client_uuid search_params]
           (guard-with-user api_token client_uuid data-set-attachment-list search_params))
        (PUT "/" [] (not-allowed "Update-all data attachments"))
        (POST "/" [] (not-allowed "Sumbit-all  data attachemnts"))
        (DELETE "/" [] (not-allowed "Delete-all data attachments"))
        (context
          "/sharing" []
          (defroutes document-routes
            (GET "/" [api_token client_uuid]
                 (guard-with-user api_token
                                  client_uuid
                                  shared-data-set-attachment-list))))))
  (context
    "/users" []
    (defroutes document-routes
      (GET "/" [api_token client_uuid]
           (guard-with-user api_token client_uuid user-list))
      (PUT "/" [] (not-allowed "Update-all users"))
      (POST "/" [] (not-allowed "Register user"))
      (DELETE "/" [] (not-allowed "Delete-all users"))
      (context
        "/:email-address" [email-address]
        (defroutes document-routes
          (GET "/" [api_token client_uuid]
               (guard-with-user api_token client_uuid user-get email-address))
          (PUT "/" [] (not-implemented "Update user"))
          (POST "/" [] (not-allowed "Register user"))
          (DELETE "/" [] (not-allowed "Delete user"))
          (context
            "/access" []
            (defroutes document-routes
              (GET "/" [api_token client_uuid]
                   (guard-with-user api_token client_uuid user-access-list email-address))
              (PUT "/" [] (not-implemented "User update-all access"))
              (POST "/" [api_token client_uuid description]
                    (guard-with-user api_token
                                     client_uuid
                                     user-access-add
                                     email-address
                                     description))
              (DELETE "/" [] (not-allowed "User delete-all access"))))))))
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
    (handler/site app-routes)
    (json/wrap-json-params)
    (json/wrap-json-response)
    (wrap-cors #".*")))
