(ns web-service.client
  (:use [ring.util.response]
        [web-service.db]
        [web-service.session])
  (:require [clojure.java.jdbc :as sql]
            [web-service.constants :as constants]))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                INTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; get the specified client
(defn get-client
  [client-name]
  (first
    (sql/query db ["select * from public.client where name=?" client-name])))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                EXTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; get the specified client, as an HTTP response
(defn client-get
  [session client-name]
  ; users who can view or manage clients can see information about a client
  (let [can-access (or (has-access session constants/view-clients)
                       (has-access session constants/manage-clients))]
    (if can-access
      (let [client (get-client client-name)]
        (if client
          (response client)
          (not-found "Client not found"))) ; inconceivable!
      (access-denied constants/view-clients))))


; list the clients in the database, as an HTTP response
(defn client-list
  [session]
  ; users who can view or manage clients can see the list of clients
  (let [can-access (or (has-access session constants/view-clients)
                       (has-access session constants/manage-clients))]
    (if can-access
      (response
        (sql/query
          db
          ["select * from public.client"]
          :row-fn :name))
      (access-denied constants/view-clients))))


; add a new client by name, as an HTTP response
(defn client-register
  [session client-name]
  (if (has-access session constants/manage-clients)
    (let
      [query "insert into public.client (name) values (?)"
       success (try (sql/execute! db [query client-name])
                    true
                    (catch Exception e
                      (println (.getMessage e))
                      false))]
      ; if we successfully created the client, return a "created" status and
      ; invoke client-get
      ; otherwise, return a "conflict" status
      (if success
        (status (client-get session client-name) 201)
        (status {:body "Client already exists"} 409)))))
