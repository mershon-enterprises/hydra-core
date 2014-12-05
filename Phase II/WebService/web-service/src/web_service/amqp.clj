(ns web-service.amqp
  (:require [langohr.core      :as rmq]
            [langohr.channel   :as lch]
            [langohr.exchange  :as le]
            [langohr.queue     :as lq]
            [langohr.consumers :as lc]
            [langohr.basic     :as lb]
            [environ.core :refer [env]]))

(def rabbitmq-credentials {:host (env :rabbitmq-host)
                           :username (env :rabbitmq-username)
                           :password (env :rabbitmq-password)})

; dynamic variables for connection and channel
(def ^:dynamic conn nil)
(def ^:dynamic ch nil)

; define the exchange name
(def ex "pi.web-service")


; send the specified payload to the fanout exchange, using the specified tag to
; describe the response
(defn broadcast
  [content-type routing-key payload]

  ; send payload to the listeners
  (lb/publish ch
              ex
              routing-key
              payload
              {:content-type content-type}))

(defn reply
  [content-type routing-key payload correlation-id]
  (lb/publish ch
              ex
              routing-key
              payload
              {:content-type content-type
               :correlation-id correlation-id}))


; start a message consumer for the specified channel, topic name, and with the
; specified consumer name
(defn start-consumer
  [ch topic-name queue-name auto-ack]
  (let [handler (fn [ch {:keys [content-type
                                delivery-tag
                                reply-to
                                correlation-id] :as meta} ^bytes payload]
                  (if (= topic-name "#")
                    ; for testing purposes, println the payload
                    (println (format "['%s'] received '%s'"
                                     queue-name
                                     (String. payload "UTF-8"))))
                  (if (= topic-name "rpc")
                    (do
                      (println (format "['%s'] received RPC call: '%s'"
                                       queue-name
                                       (String. payload "UTF-8")))
                      ; TODO -- perform the command and write a response

                      ; acknowledge the message
                      (println "sending message acknowledgement")
                      (lb/ack ch delivery-tag)
                      (println (format "sending response %s to %s" correlation-id reply-to))
                      (reply "text/json" reply-to "[core response]" correlation-id)
                      (println "done."))))]
    (lq/declare   ch queue-name {:exclusive false :auto-delete true})
    (lq/bind      ch queue-name ex {:routing-key topic-name})
    (lc/subscribe ch queue-name handler {:auto-ack auto-ack})))


; connect to the rabbitmq server, and create a fanout exchange called
; "pi.web-service"
(defn connect
  []
  (def conn (rmq/connect rabbitmq-credentials))
  (def ch (lch/open conn))

  ; declare a topic exchange that is not persisted across reboots and
  ; auto-deletes messages after all consumers are updated
  (le/declare ch ex "topic" {:durable false :auto-delete true})

  ; queue up a listening message handler for local debugging
  ;(start-consumer ch "#" (str ex ".#.core") true)
  (start-consumer ch "authentication" (str ex ".authentication.core") true)
  ;(start-consumer ch "dataset" (str ex ".dataset.core") true)
  (start-consumer ch "rpc" (str ex ".rpc.core") false))


; disconnect from the rabbitmq server
(defn disconnect
  []
  (try
    (rmq/close ch)
    (rmq/close conn)
    (catch Exception e
      ; we don't care
      ))
  ; null out the channel and connection
  (def ch nil)
  (def conn nil))
