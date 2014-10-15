(ns web-service.test.authentication
  (:require [clojure.test :refer :all]
            [clj-ldap.client :as ldap]
            [web-service.authentication :refer :all]))

; rebind the ldap functions to not hit a server
(defn mock-ldap [account-info tests]
  (with-redefs-fn
    {#'clj-ldap.client/bind? (fn [server dn password]
                               (= password "password"))
     #'clj-ldap.client/connect (fn [credentials] nil)
     #'clj-ldap.client/get (fn [server dn] account-info)
     #'clj-ldap.client/search! (fn [server dn filter search-fn]
                                 (search-fn {:sAmAccountName "account-name"
                                             :dn "lookup-domain-name"}))}
    #(tests)))

(deftest test-app

  ; test find-user-ldap
  (testing "find-user-ldap"
    (mock-ldap
      {:sAMAccountName "username"
       :givenName "first-name"
       :sn "last-name"
       :mail "email-address"
       :memberOf "group1,group2"}
      #(let [ldap-user (#'web-service.authentication/find-user-ldap "a@b.c")]
         ; verify the structure returned from find-user-ldap
         (is (= (:account-name ldap-user) "username"))
         (is (= (:first-name ldap-user) "first-name"))
         (is (= (:last-name ldap-user) "last-name"))
         (is (= (:email-address ldap-user) "email-address"))
         (is (= (:groups ldap-user) "group1,group2")))))

  ; test get-user-ldap with matching password
  (testing "get-user-ldap with good password"
    (mock-ldap
      {:sAMAccountName "username"
       :givenName "first-name"
       :sn "last-name"
       :mail "email-address"
       :memberOf "group1,group2"}
      #(let [user (#'web-service.authentication/get-user-ldap "a@b.c" "password")]
         ; verify the structure returned from find-user-ldap
         (is (= (:account-name user) "username"))
         (is (= (:first-name user) "first-name"))
         (is (= (:last-name user) "last-name"))
         (is (= (:email-address user) "email-address"))
         (is (= (:groups user) "group1,group2")))))

  ; test get-user-ldap with matching password
  (testing "get-user-ldap with bad password"
    (mock-ldap
      {:sAMAccountName "username"
       :givenName "first-name"
       :sn "last-name"
       :mail "email-address"
       :memberOf "group1,group2"}
      #(let [user (#'web-service.authentication/get-user-ldap "a@b.c" "bad-password")]
         ; verify the return value of get-user-ldap is nil
         (is (nil? user)))))

  )
