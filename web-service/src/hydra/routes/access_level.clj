(ns hydra.routes.access-level
  (:use [ring.util.response])
  (:require [compojure.core :refer :all]

            [hydra.access-level :refer [access-level-get
                                        access-level-list
                                        not-allowed]]

            [web-service.authentication :refer [guard-with-user]]))

(def access-level-routes
  (context
    "/access-levels" []
    (defroutes document-routes
      (GET "/" [api_token client_uuid]
           (guard-with-user api_token client_uuid access-level-list))
      (PUT "/" [] (not-allowed "Update-all access levels"))
      (POST "/" [] (not-allowed "Create access level"))
      (DELETE "/" [] (not-allowed "Delete-all access levels"))
      (context
        "/:description" [description]
        (defroutes document-routes
          (GET "/" [api_token client_uuid]
               (guard-with-user api_token client_uuid access-level-get description))
          (PUT "/" [] (not-allowed "Update access level"))
          (POST "/" [] (not-allowed "Create access level"))
          (DELETE "/" [] (not-allowed "Delete access level")))))))
