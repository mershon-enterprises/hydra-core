(ns hydra.routes.branding
  (:use [ring.util.response])
  (:require [compojure.core :refer :all]
            [environ.core :refer [env]]))

(defn get-branding
  []
  (response {:company-name (env :hydra-branding-company-name)
             :company-logo (env :hydra-branding-company-logo)
             :contact-email (env :hydra-branding-contact-email)
             :contact-phone (env :hydra-branding-contact-phone)}))

(def branding-routes
  (GET "/branding" [] (get-branding)))
