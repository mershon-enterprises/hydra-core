(ns hydra.test.routes.data
  (:require [clojure.test :refer :all]
            [ring.mock.request :as mock]
            [cheshire.core :refer :all]

            [hydra.constants :as constants]

            [web-service.user-helpers :refer [get-user-access]]
            [web-service.authentication :refer [guard-with-user]]
            [web-service.session :refer [log-detail]]
            [web-service.handler :refer [app]]))

(deftest test-submit-data
  (let [data-set [{:description "User name" :type "text"    :value "adminuser"}
                  {:description "Car Make"  :type "text"    :value "Ford"}
                  {:description "Car Model" :type "text"    :value "Mustang"}
                  {:description "Car Year"  :type "integer" :value 1976}]
        submit-data {:uuid "85cb0d05-71f3-033f-b586-6cbb355ca2f3"
                     :date_created (java.util.Date.)
                     :created_by "admin@example.com"
                     :data (generate-string data-set)}]
    (with-redefs-fn
     {#'web-service.data/data-set-submit
      (fn [email uuid date-created created-by data]
        ; return the submit data back
        submit-data)
      #'web-service.user-helpers/get-user-access
      (fn [email-address]
        [constants/manage-data])
      #'web-service.authentication/guard-with-user
      (fn [api-token client-uuid fun & args]
        (apply fun (:email_address "test@user") args))}

     #(testing "add primitive data"
       (let [response (app (mock/request :post "/data" submit-data))
             json-data (parse-string (:data response) true)]
        (is (= 200 (:status response)))

        (let [all-keys [:headers :body :data :status]]
          (doseq [k all-keys]
            (is (true? (contains? response k)))))

        (is (= data-set json-data)))))))

(deftest test-get-data
  (let [data-set [{:description "User name" :type "text"    :value "adminuser"}
                  {:description "Car Make"  :type "text"    :value "Ford"}
                  {:description "Car Model" :type "text"    :value "Mustang"}
                  {:description "Car Year"  :type "integer" :value 1976}]
        response-data {:uuid "85cb0d05-71f3-033f-b586-6cbb355ca2f4"
                       :date_created (java.util.Date.)
                       :location nil
                       :client   nil
                       :data data-set
                       :created_by "test@user"}]

    (with-redefs-fn
     {#'web-service.data/data-set-get
      (fn [email-address uuid & args]
        ; return the submit data array back
        {:response response-data})
      #'web-service.user-helpers/get-user-access
      (fn [email-address]
        [constants/manage-data])
      #'web-service.authentication/guard-with-user
      (fn [api-token client-uuid fun & args]
        (apply fun (:email_address "test@user") args))}

     #(testing "get primitive data"
       (let [response (app (mock/request :get "/data/85cb0d05-71f3-033f-b586-6cbb355ca2f4"))
             json-data (:response response)]
        (is (= 200 (:status response)))
        (let [all-keys [:headers :body :status]]
          (doseq [k all-keys]
            (is (true? (contains? response k)))))
        (is (= response-data json-data)))))))
