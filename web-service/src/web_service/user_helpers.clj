(ns web-service.user-helpers
  (:use [ring.util.response])
  (:require [web-service.schema :as queries :include-macros true]))
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                INTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(defn add-user!
  "add the specified user"
  [email-address]
  (try (queries/add-user! {:email_address email-address} {})
       true
       (catch Exception e
         false)))

(defn get-user
  "get the specified user"
  [email-address]
  (queries/get-user {:email_address email-address} {:result-set-fn (comp first)}))

(defn get-user-access
  "get the access for the specified user"
  [email-address]
  (queries/get-user-access {:email_address email-address}
                           {:row-fn :description}))
