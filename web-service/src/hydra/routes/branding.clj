(ns hydra.routes.branding
  (:use [ring.util.response])
  (:require [compojure.core :refer :all]
            [environ.core :refer [env]]))

(defn get-branding
  []
  (response {:company-name (env :hydra-branding-company-name
                                "Mershon Enterprises")
             :company-logo (env :hydra-branding-company-logo
                                "/images/logo-full.png")
             :contact-email (env :hydra-branding-contact-email
                                 "support@mershonenterprises.com")
             :contact-phone (env :hydra-branding-contact-phone
                                 "(661) 425-9099")}))

(def branding-routes
  (GET "/branding" [] (get-branding)))
