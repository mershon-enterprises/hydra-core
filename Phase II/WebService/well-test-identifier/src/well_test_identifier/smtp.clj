(ns well-test-identifier.smtp
  (:require [clojure.string :as string]
            [postal.core :as postal]
            [environ.core :refer [env]]))

(defn- get-server-spec
  []
  {:host (env :smtp-host)
   :port (Integer. (env :smtp-port))
   :user (env :smtp-username)
   :pass (env :smtp-password)})

(defn- sanitize-notes
  [dirty-notes]
  (string/replace (string/replace dirty-notes
                                  #"\<.*?\>"
                                  "") ; trim HTML tags
                  "\n"
                  "<br>"))            ; preserve newlines

(defn send-well-test
  [subject test-notes attachment]
  (postal/send-message (get-server-spec)
                       {:from "hydra@slixbits.com"
                        :to (env :smtp-to-address)
                        :subject subject
                        :body [{:type "text/html"
                                :content (sanitize-notes test-notes)}
                               {:type :attachment
                                :content (java.io.File. attachment)}]}))