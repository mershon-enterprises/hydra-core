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


; get the locations for the specified client
(defn get-client-locations
  [client-name]
  (sql/query
    db
    [(str "select distinct cl.description "
          "from public.client_location cl "
          "inner join public.client c "
          "  on cl.client_id=c.id "
          "where c.name=?") client-name]
    :row-fn :description))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                EXTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; get the specified client, as an HTTP response
(defn client-get
  [session client-name]

  ; log the activity to the session
  (log-detail session
              constants/session-activity
              (str constants/session-get-client " " client-name))

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

  ; log the activity to the session
  (log-detail session
              constants/session-activity
              constants/session-list-clients)

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

  ; log the activity to the session
  (log-detail session
              constants/session-activity
              (str constants/session-add-client " " client-name))

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


; list the locations for the specified client, as an HTTP response
(defn client-location-list
  [session client-name]

  ; log the activity to the session
  (log-detail session
              constants/session-activity
              (str constants/session-list-client-locations " "
                   client-name))

  (let [can-access (or (has-access session constants/view-clients)
                       (has-access session constants/manage-clients))]
    (if can-access
      (response (get-client-locations client-name))
      (access-denied constants/view-clients))))


; add the specified location to the client, as an HTTP response
(defn client-location-add
  [session client-name description]

  ; log the activity to the session
  (log-detail session
              constants/session-activity
              (str constants/session-add-client-location " "
                   client-name " " description))

  (if (has-access session constants/manage-clients)
    (let
      [query (str "insert into public.client_location "
                  "(client_id, description) values "
                  "((select id from public.client where name=?), ?)")
       success (try (sql/execute! db [query client-name description])
                    true
                    (catch Exception e
                      (println (.getMessage e))
                      (println (.getMessage (.getNextException e)))
                      false))]

      ; if we successfully created the client location, return a "created"
      ; status and invoke client-location-get
      ; otherwise, return a "conflict" status
      (if success
        (status (client-location-list session client-name) 201)
        (status {:body (str "Client location for "
                            client-name
                            " already exists: "
                            description)}
                409)))
    (access-denied constants/manage-clients)))
