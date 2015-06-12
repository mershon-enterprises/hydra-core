(ns web-service.authentication.match)

(defn find-user
  [email-address]

  {:first-name    "Test"
   :last-name     "User"
   :email-address email-address
   :is-admin      (not= -1 (.indexOf email-address "admin"))})

(defn login
  [email-address password]

  ; using 'match' authentication, email and password just have to match
  (if (= email-address password)
    (find-user email-address)
    nil))
