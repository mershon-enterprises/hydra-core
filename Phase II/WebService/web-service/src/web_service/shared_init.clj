(ns web-service.shared-init
  (:use [web-service.data])
  (:require [cheshire.core :refer :all]
            [langohr.basic :as lb]
            [web-service.amqp :as amqp]))

(defn init
  []
  (let [ch (amqp/connect)]
    ; listen for incoming authentications and just print to the standard out
    (amqp/start-consumer
      ch
      "authentication"
      (str amqp/ex ".authentication.core")
      true
      (fn [topic-name queue-name meta payload]
        ; for testing purposes, print the payload
        (println (format "['%s'] received '%s'"
                         queue-name
                         (String. payload "UTF-8")))))

    ; listen for incoming RPC calls. Command must be available on local
    ; namespace
    (amqp/start-consumer
      ch
      "rpc"
      (str amqp/ex ".rpc.core")
      false
      (fn [topic-name queue-name meta payload]
        (do
          (println (format "['%s'] received RPC call: '%s'"
                           queue-name
                           (String. payload "UTF-8")))

          ; perform the command and write a response
          (let [command-json (parse-string (String. payload "UTF-8") true)
                response (try
                           (apply (resolve
                                    (symbol (:command command-json)))
                                  (:args command-json))
                           (catch NullPointerException ex
                             (format "Specified command '%s' does not exist"
                                     (:command command-json))))]
            ; acknowledge the message and send response
            (lb/ack ch (:delivery-tag meta))
            (amqp/reply "text/json" (:reply-to meta) response (:correlation-id meta))))))))

(defn destroy
  []
  (amqp/disconnect))
