(ns well-test-identifier.amqp
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
  (lb/publish ch ex routing-key payload {:content-type content-type}))

; start a message consumer for the specified channel, topic name, and with the
; specified consumer name
(defn start-consumer
  [ch topic-name queue-name impl]
  (let [handler (fn [ch {:keys [content-type delivery-tag] :as meta} ^bytes payload]
                  (impl topic-name queue-name (String. payload "UTF-8")))]
    (lq/declare   ch queue-name {:exclusive false :auto-delete true})
    (lq/bind      ch queue-name ex {:routing-key topic-name})
    (lc/subscribe ch queue-name handler {:auto-ack true})))

(defn invoke
  [content-type payload callback]

  ; use an async channel to block waiting for the response
  (let [message-uuid "0000"
        listener (lq/declare-server-named ch {:exclusive true})
        handler (fn [ch {:keys [content-type
                                delivery-tag
                                correlation-id] :as meta} ^bytes payload]
                  (println (format "received response %s from core" correlation-id))
                  (callback (String. payload "UTF-8"))
                  (println "callback complete")
                  ;(lb/cancel ch listener)
                  ;(println "no longer listening")
                  )]

    (lq/bind ch listener ex {:routing-key "rpc"})
    (lc/subscribe ch listener handler {:auto-ack true})

    ; send a payload and then expect a response on the rpc queue
    (lb/publish ch ex "rpc" payload {:content-type content-type
                                     :reply-to listener
                                     :correlation-id message-uuid})))


; connect to the rabbitmq server, and create a fanout exchange called
; "pi.web-service"
(defn connect
  []
  (def conn (rmq/connect rabbitmq-credentials))
  (def ch (lch/open conn))

  ; declare a topic exchange that is not persisted across reboots and
  ; auto-deletes messages after all consumers are updated
  (le/declare ch ex "topic" {:durable false :auto-delete true})

  ; return the open connection
  ch)


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
