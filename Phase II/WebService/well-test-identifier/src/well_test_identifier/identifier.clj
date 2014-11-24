(ns well-test-identifier.identifier
  (:require [cheshire.core :refer :all]))



(defn- is-a-well-test
  "Checks for wellName, trailerNumber,  clientName, fieldName, and at least 3
  attachments"
  [{well-test-data :data}] ; we only care about the data in the well test

  ; we require well name, trailer number, client name, and field name to
  ; consider this a well test
  (let [required-strings ["wellName" "trailerNumber" "clientName" "fieldName"]]
    (and
      ; expect one string value of each required description
      (every?
        (fn [required-string]
          ; destructure the properties out of the data-item
          (some (fn [{type :type description :description value :value}]
                  (and (= "string" type)
                       (= required-string description)
                       (and (not (nil? value))
                            (not (empty? value)))))
                well-test-data))
        required-strings)
      ; expect at least 2 CSV file attachments
      (>= (count (filter (fn [{type :type mime-type :mime_type}]
                           (and (= "attachment" type)
                                (= "text/csv" mime-type)))
                         well-test-data))
         2)
      ; expect at least 1 Excel file attachment
      (>= (count (filter (fn [{type :type mime-type :mime_type}]
                           (and (= "attachment" type)
                                (= "application/vnd.ms-excel" mime-type)))
                         well-test-data))
          1))))

(defn identify
  [well-test-json]
  (let [well-test-data (parse-string well-test-json true)]
    (if (is-a-well-test well-test-data)
      (println "is a well test")
      (println "is not a well test")

      ; TODO - identify the client name and field name values in the dataset, and
      ; use them to populate their respective tables associated to the dataset

      ; TODO - bundle together attachments as a zip file and email out to
      ; pwt@slixbits.com

      ; TODO - fire another AMQP event containing the original data plus a flag
      ; notifying that this is a well test, to trigger downstream reporting
    )

    ))
