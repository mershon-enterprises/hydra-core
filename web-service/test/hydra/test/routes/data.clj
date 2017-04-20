(ns hydra.test.routes.data
  (:require [clojure.test :refer :all]
            [ring.mock.request :as mock]
            [cheshire.core :refer [generate-string parse-string]]

            [hydra.constants :as constants]

            [web-service.user-helpers :refer [get-user-access]]
            [web-service.authentication :refer [guard-with-user]]
            [web-service.session :refer [log-detail]]
            [web-service.handler :refer [app]]))

(def dataset1
  {:uuid "85cb0d05-71f3-033f-b586-6cbb355ca2f2"
   :date_created (java.util.Date.)
   :location nil
   :client   nil
   :data [{:description "User name" :type "text"    :value "adminuser"}
          {:description "Car Make"  :type "text"    :value "Ford"}
          {:description "Car Model" :type "text"    :value "Mustang"}
          {:description "Car Year"  :type "integer" :value 1976}]
   :created_by "test@user"})


(deftest test-submit-data
  (let [stringed-data (-> (assoc dataset1 :data (generate-string (:data dataset1)))
                          (dissoc :location :client))] ; GOTCHA -- drop null key-values
    (with-redefs-fn
     {#'web-service.data/data-set-submit
      (fn [email uuid date-created created-by data]
        ; return the submit data back
        {:response data})
      #'web-service.user-helpers/get-user-access
      (fn [email-address]
        [constants/manage-data])
      #'web-service.authentication/guard-with-user
      (fn [api-token client-uuid fun & args]
        (apply fun (:email_address "test@user") args))}

     #(testing "add primitive data"
       (let [response (app (mock/request :post "/data" stringed-data))
             json-data (parse-string (:response response) true)]
        (is (= 200 (:status response)))
        (let [all-keys [:headers :body :status]]
          (doseq [k all-keys]
            (is (true? (contains? response k)))))

        (is (= (:data dataset1) json-data)))))))


(deftest test-search-for-data
  (with-redefs-fn
   {#'web-service.data/data-set-list
    (fn [email-address search-params]
      ; return the submit data array back
      {:response [dataset1]})
    #'web-service.user-helpers/get-user-access
    (fn [email-address]
      [constants/manage-data])
    #'web-service.authentication/guard-with-user
    (fn [api-token client-uuid fun & args]
      (apply fun (:email_address "test@user") args))}

   #(testing "search for primitive data"
     (let [response (app (mock/request :get "/data"))
           json-data (:response response)]
      (is (= 200 (:status response)))
      (let [all-keys [:headers :body :status]]
        (doseq [k all-keys]
          (is (true? (contains? response k)))))
      (is (= dataset1 (first json-data)))))))

(deftest test-get-data
  (with-redefs-fn
   {#'web-service.data/data-set-get
    (fn [email-address uuid & args]
      ; return the submit data array back
      {:response dataset1})
    #'web-service.user-helpers/get-user-access
    (fn [email-address]
      [constants/manage-data])
    #'web-service.authentication/guard-with-user
    (fn [api-token client-uuid fun & args]
      (apply fun (:email_address "test@user") args))}

   #(testing "get primitive data"
     (let [response (app (mock/request :get (str "/data/" (:uuid dataset1))))
           json-data (:response response)]
      (is (= 200 (:status response)))
      (let [all-keys [:headers :body :status]]
        (doseq [k all-keys]
          (is (true? (contains? response k)))))
      (is (= dataset1 json-data))))))

(deftest test-reprocess-data
  (with-redefs-fn
   {#'web-service.data/data-set-reprocess
    (fn [email-address uuid]
      ; return the submit data array back
      {:status 201
       :response dataset1})
    #'web-service.user-helpers/get-user-access
    (fn [email-address]
      [constants/manage-data])
    #'web-service.authentication/guard-with-user
    (fn [api-token client-uuid fun & args]
      (apply fun (:email_address "test@user") args))}

   #(testing "get primitive data"
     (let [response (app (mock/request :post (str "/data/" (:uuid dataset1) "/reprocess")))
           json-data (:response response)]
      (is (= 201 (:status response)))
      (let [all-keys [:headers :body :status]]
        (doseq [k all-keys]
          (is (true? (contains? response k)))))
      (is (= dataset1 json-data))))))
