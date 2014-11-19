{:test {:env
        {:database-credentials {:host     "localhost"
                                :port     5432
                                :db-name  "postgres"
                                :schema   "public"
                                :user     "postgres"
                                :password "password"}
         :ldap-credentials {:host         "testHost"
                            :bind-dn      "testUser"
                            :password     "testPassword"}
         :rabbitmq-credentials {:host     "localhost"
                                :port     5672
                                :username "guest"
                                :password "guest"
                                :vhost    "/"}}}
 :prod {:env
        {:database-credentials {:host     "hydra-database-core.clyhxhyl70jt.us-west-2.rds.amazonaws.com"
                                :port     5432
                                :db-name  "hydra"
                                :schema   "public"
                                :user     "postgres"
                                :password "ph6qu7a4eMEzupre"}
         :ldap-credentials {:host         "192.168.138.12"
                            :bind-dn      "pic\\admin"
                            :password     "adminpassword"}
         :rabbitmq-credentials {:host     "172.31.27.248"
                                :port     5672
                                :username "guest"
                                :password "guest"
                                :vhost    "/"}}}}
