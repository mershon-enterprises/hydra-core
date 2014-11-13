(ns well-test-identifier.identifier
  (:require [cheshire.core :refer :all]))

(defn identify
  [well-test-json]
  (let [well-test-data (parse-string well-test-json true)]

    ; print the properties of the dataset
    (println (:uuid well-test-data))
    (println (:date_created well-test-data))
    (println (:created_by well-test-data))
    (println (count (:data well-test-data)))

    ; TODO - check for wellName, trailerNumber, clientName, fieldName, and at
    ; least 1 attachment to identify this as a well test

    ; if this is a well test:

    ; TODO - identify the client name and field name values in the dataset, and
    ; use them to populate their respective tables associated to the dataset

    ; TODO - bundle together attachments as a zip file and email out to
    ; pwt@slixbits.com

    ; TODO - fire another AMQP event containing the original data plus a flag
    ; notifying that this is a well test, to trigger downstream reporting

    true
    ))
