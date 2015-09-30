(ns web-service.authentication.persona)

(defn find-user
  [email-address]

  {:first-name    (.substring email-address
                              0
                              (.indexOf email-address
                                        "@"))
   :last-name     ""
   :email-address email-address
   :is-admin      false})

(defn login
  [email-address password]

  ; Using 'persona' authentication, anyone with a Mozilla Persona account is
  ; allowed to login, but by default their permissions are very limited.
  (find-user email-address))
