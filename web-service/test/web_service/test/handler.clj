(ns web-service.test.handler
  (:use [web-service.test.authentication :only (mock-ldap)])
  (:require [clojure.test :refer :all]
            [web-service.handler :refer :all]
            [ring.mock.request :as mock]
            [cheshire.core :refer :all]
            [web-service.amqp :as amqp]))

(defn test-wrapper [tests]
  (amqp/connect)
  (tests)
  (amqp/disconnect))

(use-fixtures :once test-wrapper)

(deftest test-app

  ; test /admin-authenticate with good credentials and admin access
  (testing "admin-authenticate route with good credentials"
    (mock-ldap
      {:sAMAccountName "admin"
       :givenName "first-name"
       :sn "last-name"
       :mail "email-address"
       :memberOf "group1,Domain Admins"}
      #(let [response (app (mock/request :post
                                         "/admin-authenticate"
                                         {:client_uuid "00000000-0000-0000-0000-000000000000"
                                          :email_address "a@b.c"
                                          :password "password"
                                          :user_email_address "email-address"}))
             json-body (parse-string (:body response) true)
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

  ; test /admin-authenticate with good credentials, but no domain admin access
  (testing "admin-authenticate route with bad credentials"
    (mock-ldap
      {:sAMAccountName "not-admin"
       :givenName "first-name"
       :sn "last-name"
       :mail "email-address"
       :memberOf "group1,group2"}
      #(let [response (app (mock/request :post
                                         "/admin-authenticate"
                                         {:client_uuid "00000000-0000-0000-0000-000000000000"
                                          :email_address "a@b.c"
                                          :password "password"
                                          :user_email_address "email-address"}))]

         ; verify that the response status is HTTP 401
         (is (= (:status response) 401))

         ; verify the response body says "Invalid credentials"
         (is (= (:body response) "Invalid credentials")))))

  ; test /admin-authenticate with bad credentials
  (testing "admin-authenticate route with bad credentials"
    (mock-ldap
      nil
      #(let [response (app (mock/request :post
                                         "/admin-authenticate"
                                         {:email_address "a@b.c"
                                          :password "password"
                                          :user_email_address "email-address"}))]

         ; verify that the response status is HTTP 401
         (is (= (:status response) 401))

         ; verify the response body says "Invalid credentials"
         (is (= (:body response) "Invalid credentials")))))

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
                                         {:client_uuid "00000000-0000-0000-0000-000000000000"
                                          :email_address "a@b.c"
                                          :password "password"}))
             json-body (parse-string (:body response) true)
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
                                         {:client_uuid "00000000-0000-0000-0000-000000000000"
                                          :email_address "a@b.c"
                                          :password "password"}))]

         ; verify that the response status is HTTP 401
         (is (= (:status response) 401))

         ; verify the response body says "Invalid credentials"
         (is (= (:body response) "Invalid credentials")))))

  ; test /version
  (testing "version route"
    (let [response (app (mock/request :get "/version"))
          json-body (parse-string (:body response) true)]

      ; verify that the response status is HTTP 200
      (is (= (:status response) 200))

      ; verify that /version returns a map with the version number
      (contains? json-body :version)))

  (testing "not-found route"
    (let [response (app (mock/request :get "/invalid"))]
      (is (= (:status response) 404)))))
