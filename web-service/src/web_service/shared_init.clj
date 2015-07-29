(ns web-service.shared-init
  (:use [web-service.data])
  (:require [cheshire.core :refer :all]
            [langohr.basic :as lb]
            [web-service.amqp :as amqp]
            [web-service.schema :as schema]))

(defn init
  []
  ; update the database
  ;(schema/update)

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
        ; perform the command and write a response
        (let [command-json (parse-string (String. payload "UTF-8") true)
              response (let [{cmd :command
                              args :args} command-json
                             callable (ns-resolve 'web-service.shared-init
                                                  (symbol cmd))]
                         (if callable
                           (generate-string (apply callable args))
                           (format "Failed to resolve command '%s'"
                                   cmd)))]
          ; acknowledge the message and send response
          (lb/ack ch (:delivery-tag meta))
          (amqp/reply "text/json" (:reply-to meta) response (:correlation-id meta)))))))

(defn destroy
  []
  (amqp/disconnect))
