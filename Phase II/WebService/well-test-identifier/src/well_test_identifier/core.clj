(ns well-test-identifier.core
  (:use [well-test-identifier.amqp]))

(defn -main
  []
  (well-test-identifier.amqp/connect))
