(ns well-test-identifier.identifier
  (:require [cheshire.core :refer :all]))



(defn- is-a-well-test
  "Checks for wellName, trailerNumber,  clientName, fieldName, and at least 3
  attachments"
  [{uuid :uuid
    well-test-data :data}]
  (println (format "Checking if dataset %s is a well test" uuid))

  ; we require well name, trailer number, client name, and field name to
  ; consider this a well test
  (let [required-keys ["wellName" "trailerNumber" "clientName" "fieldName"]]
    ; expect one text value of each required description
    (if (not (every?
               (fn [required-key]
                 ; destructure the properties out of the data-item
                 (some (fn [{type :type
                             description :description
                             value :value}]
                         (and (= "text" type)
                              (= required-key description)
                              (and (not (nil? value))
                                   (not (empty? value)))))
                       well-test-data))
               required-keys))
      (do
        (println "Missing one or more required key.")
        (println (str "Keys were: "
                      (string/join "," (filter (fn [ds-item]
                                                 (= "text" (:type ds-item)))
                                               well-test-data))))
        false)

      ; expect at least 2 CSV file attachments
      (if (not (>= (count (filter (fn [{type :type mime-type :mime_type}]
                                    (and (= "attachment" type)
                                         (= "text/csv" mime-type)))
                                  well-test-data))
                   2))
        (do
          (println "Need at least 1 CSV attachments")
          false)
        ; expect at least 1 Excel file attachment
        (if (not (>= (count (filter (fn [{type :type mime-type :mime_type}]
                                      (and (= "attachment" type)
                                           (= "application/vnd.ms-excel" mime-type)))
                                    well-test-data))
                     1))
          (do
            (println "Need at least 1 Excel attachment")
            false)

          ; if all 3 criteria are matched, this is a well test
          (do
            (println (format "Dataset %s is a well test" uuid))
            true))))))

(defn identify
  [well-test-json]
  (let [well-test-data (parse-string well-test-json true)]
    (if (is-a-well-test well-test-data)
      (do
        ; TODO - identify the client name and field name values in the dataset, and
        ; use them to populate their respective tables associated to the dataset

        ; TODO - bundle together attachments as a zip file and email out to
        ; pwt@slixbits.com

        ; return true to fire another AMQP event with the original data, but on
        ; the well-test routing key, to trigger downstream reporting
        true)
      false)))
