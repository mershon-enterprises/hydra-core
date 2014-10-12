{:test {:env {:ldap-credentials {:host "testHost"
                                 :bind-dn "testUser"
                                 :password "testPassword"}}}
 :prod {:env {:ldap-credentials {:host "192.168.138.12"
                                 :bind-dn "pic\\admin"
                                 :password "adminpassword"}
              :server {:host "192.168.138.2"
                       :port 25
                       :user "pwt"
                       :pass "44Red22"}}}}

