(ns well-test-identifier.shared-init
  (:require [well-test-identifier.amqp :as amqp]
            [well-test-identifier.identifier :as ident]))

(defn init
  []
  (let [ch (amqp/connect)]
    ; listen for incoming data-sets and attempt to identify them as well tests
    (amqp/start-consumer
      ch
      "dataset"
      (str amqp/ex ".dataset.identifier")
      (fn [topic-name queue-name payload]
        ; have the identifier try to identify a well test
        (if (= topic-name "dataset")
          (ident/identify payload)))))

    ; listen for identified well tests and do nothing
    ; (amqp/start-consumer
    ;   ch
    ;   "well-test"
    ;   (str ex ".well-test.identifier")
    ;   (fn [topic-name queue-name payload]
    ;     ; do nothing
    ;     ))
  )

(defn destroy
  []
  (amqp/disconnect))
