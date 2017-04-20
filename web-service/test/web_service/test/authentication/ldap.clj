(ns web-service.test.authentication.ldap
  (:require [clojure.test :refer :all]
            [clj-ldap.client :as ldap]
            [web-service.authentication.ldap :refer :all]))

; rebind the ldap functions to not hit a server
(defn mock-ldap [account-info tests]
  (with-redefs-fn
    {#'clj-ldap.client/bind? (fn [server dn password]
                               (= password "password"))
     #'clj-ldap.client/connect (fn [credentials] nil)
     #'clj-ldap.client/get (fn [server dn] account-info)
     #'clj-ldap.client/search! (fn [server dn filter search-fn]
                                 (if (not (nil? account-info))
                                   (search-fn {:sAmAccountName (:sAmAccountName account-info)
                                               :dn "lookup-domain-name"})
                                   (throw (Exception. "not found"))))}
    #(tests)))

(deftest test-app

  ; test find-user with good account
  (testing "find-user with good account"
    (mock-ldap
      {:sAMAccountName "username"
       :givenName "first-name"
       :sn "last-name"
       :mail "email-address"
       :memberOf "group1,group2"}
      #(let [ldap-user (#'web-service.authentication.ldap/find-user "a@b.c")]
         ; verify the structure returned from find-user
         (is (= (:account-name ldap-user) "username"))
         (is (= (:first-name ldap-user) "first-name"))
         (is (= (:last-name ldap-user) "last-name"))
         (is (= (:email-address ldap-user) "email-address"))
         (is (false? (:is-admin ldap-user))))))

  ; test find-user with bad account
  (testing "find-user with bad account"
    (mock-ldap
      nil
      #(let [ldap-user (#'web-service.authentication.ldap/find-user "a@b.c")]
         ; verify the return value of find is nil
         (is (nil? ldap-user)))))

  ; test login with matching password
  (testing "login with good password"
    (mock-ldap
      {:sAMAccountName "username"
       :givenName "first-name"
       :sn "last-name"
       :mail "email-address"
       :memberOf "group1,group2"}
      #(let [user (#'web-service.authentication.ldap/login "a@b.c" "password")]
         ; verify the structure returned from login
         (is (= (:account-name user) "username"))
         (is (= (:first-name user) "first-name"))
         (is (= (:last-name user) "last-name"))
         (is (= (:email-address user) "email-address"))
         (is (false? (:is-admin user))))))

  ; test login with matching password
  (testing "login with bad password"
    (mock-ldap
      {:sAMAccountName "username"
       :givenName "first-name"
       :sn "last-name"
       :mail "email-address"
       :memberOf "group1,group2"}
      #(let [user (#'web-service.authentication.ldap/login "a@b.c" "bad-password")]
         ; verify the return value of login is nil
         (is (nil? user))))))
