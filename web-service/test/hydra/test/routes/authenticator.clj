(ns hydra.test.routes.authenticator
  (:require [clojure.test :refer :all]
            [ring.mock.request :as mock]
            [cheshire.core :refer :all]

            [web-service.authentication.match :refer [config]]
            [web-service.handler :refer [app]]))

(deftest test-match-authenticator
  (testing "authenticator route"
    (let [response (app (mock/request :get "/authenticator"))
          json-body (parse-string (:body response) true)]

      ; verify that the response status is HTTP 200
      (is (= (:status response) 200))

      ; verify the configuration returned from /authenticator matches what is
      ; assigned
      (is (= (config) json-body)))))
