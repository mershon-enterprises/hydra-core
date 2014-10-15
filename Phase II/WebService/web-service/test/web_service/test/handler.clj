(ns web-service.test.handler
  (:use [web-service.test.authentication :only (mock-ldap)])
  (:require [clojure.test :refer :all]
            [web-service.handler :refer :all]
            [ring.mock.request :as mock]
            [clojure.data.json :as json]))

(deftest test-app

  ; test /authenticate with good credentials
  (testing "authenticate route with good credentials"
    (mock-ldap
      {:sAMAccountName "username"
       :givenName "first-name"
       :sn "last-name"
       :mail "email-address"
       :memberOf "group1,group2"}
      #(let [response (app (mock/request :post
                                         "/authenticate"
                                         {:email_address "a@b.c"
                                          :password "password"}))
             json-body (json/read-str (:body response)
                                      :key-fn keyword)
             content (:response json-body)]

         ; verify that the response status is HTTP 200
         (is (= (:status response) 200))

         ; check the token exists
         (contains? json-body :token)
         (contains? json-body :token_expiration_date)

         ; check the email
         (contains? content :email_address)
         (is (= (:email_address content) "email-address"))

         ; check the first name
         (contains? content :first_name)
         (is (= (:first_name content) "first-name"))

         ; check the last name
         (contains? content :last_name)
         (is (= (:last_name content) "last-name"))

         ; check for an empty list of access for the user
         (contains? content :access)
         (is (empty? (:access content))))))

  ; test /authenticate with bad credentials
  (testing "authenticate route with bad credentials"
    (mock-ldap
      nil
      #(let [response (app (mock/request :post
                                         "/authenticate"
                                         {:email_address "a@b.c"
                                          :password "password"}))]

         ; verify that the response status is HTTP 401
         (is (= (:status response) 401))

         ; verify the response body says "Invalid credentials"
         (is (= (:body response) "Invalid credentials")))))

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
