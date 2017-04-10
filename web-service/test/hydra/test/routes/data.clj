(ns hydra.test.routes.data
  (:require [clojure.test :refer :all]
            [ring.mock.request :as mock]
            [cheshire.core :refer :all]

            [web-service.user-helpers :refer [get-user-access]]
            [web-service.authentication :refer [guard-with-user]]
            [web-service.handler :refer [app]]))

(deftest test-add-data
  (with-redefs-fn
    {#'web-service.authentication/guard-with-user
     (fn [api-token client-uuid fun & args]
       (apply fun (:email_address "test@user" args)))}
    (testing "add primitive data"
      (let [response (app (mock/request :post "/data"
                                        {:uuid nil
                                         :date_created nil
                                         :created_by "me"
                                         :data [{:type "boolean" :value false}]}))
            json-body (parse-string (:body response) true)]
        (is (= 200 (:status response)))

        (contains? json-body true)))))
