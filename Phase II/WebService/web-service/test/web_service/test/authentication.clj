(ns web-service.test.authentication
  (:require [clojure.test :refer :all]
            [clj-ldap.client :as ldap]
            [web-service.authentication :refer :all]))

; rebind the ldap functions to not hit a server
(defn override-ldap [tests]
  (with-redefs-fn {#'clj-ldap.client/connect (fn [credentials] nil)
                   #'clj-ldap.client/search! (fn [server dn filter search-fn]
                                               (search-fn {:sAmAccountName "account-name"
                                                           :dn "lookup-domain-name"}))
                   #'clj-ldap.client/get (fn [server dn]
                                           {:sAMAccountName "username"
                                            :givenName "first-name"
                                            :sn "last-name"
                                            :mail "email-address"
                                            :memberOf "group1,group2"})}
    #(tests)))

(deftest test-app

  ; test find-user-ldap
  (testing "find-user-ldap"
    (override-ldap
      #(let [user (#'web-service.authentication/find-user-ldap "asdf@anywhere.com")]
         ; verify the structure returned from find-user-ldap
         (is (= (:account-name user) "username"))
         (is (= (:first-name user) "first-name"))
         (is (= (:last-name user) "last-name"))
         (is (= (:email-address user) "email-address"))
         (is (= (:groups user) "group1,group2"))))))
