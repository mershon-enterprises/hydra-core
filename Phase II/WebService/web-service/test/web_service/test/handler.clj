(ns web-service.test.handler
  (:require [clojure.test :refer :all]
            [web-service.handler :refer :all]
            [ring.mock.request :as mock]
            [clojure.data.json :as json]))

(deftest test-app

  ; test /version
  (testing "version route"
    (let [response (app (mock/request :get "/version"))
          json-body (json/read-str (:body response)
                                   :key-fn keyword)]

      ; verify that the response status is HTTP 200
      (is (= (:status response) 200))

      ; verify that /version returns a map with the version number
      (contains? json-body :version)))

  (testing "not-found route"
    (let [response (app (mock/request :get "/invalid"))]
      (is (= (:status response) 404)))))
