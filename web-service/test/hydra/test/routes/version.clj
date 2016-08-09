(ns hydra.test.routes.version
  (:require [clojure.test :refer :all]
            [ring.mock.request :as mock]
            [cheshire.core :refer :all]

            [web-service.handler :refer [app]]))

(deftest test-version
  (testing "version route"
    (let [response (app (mock/request :get "/version"))
          json-body (parse-string (:body response) true)]

      ; verify that the response status is HTTP 200
      (is (= (:status response) 200))

      ; verify that /version returns a map with the version number
      (contains? json-body :version))))
