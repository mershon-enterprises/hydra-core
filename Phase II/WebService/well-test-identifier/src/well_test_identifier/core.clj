(ns well-test-identifier.core
  (:use [well-test-identifier.amqp])
  (:gen-class))

(defn -main
  []
  (well-test-identifier.amqp/connect))
