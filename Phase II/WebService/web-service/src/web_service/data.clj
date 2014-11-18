(ns web-service.data
  (:use [ring.util.response]
        [web-service.db]
        [web-service.session]
        [web-service.user-helpers])
  (:require [clojure.java.jdbc :as sql]
            [web-service.constants :as constants]
            [cheshire.core :refer :all]
            [web-service.amqp :as amqp]))

(import java.sql.SQLException)
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                INTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


(defn- get-attachment-data
  [data-set-id]
  (let [query (str "select 'attachment' as type, filename, "
                   "  octet_length(contents) as bytes "
                   "from public.data_set_attachment "
                   "where data_set_id=? "
                   "and date_deleted is null")]
    (sql/query (db) [query data-set-id])))


(defn- get-primitive-data
  [type data-set-id]
  (let [query (str "select '" type "' as type, description, value "
                   "from public.data_set_" type " "
                   "where data_set_id=? "
                   "and date_deleted is null")]
    (sql/query (db) [query data-set-id])))


; format the specified row from the data_set_attachment info display
(defn- format-data-attachment-info [row]
  {:filename (:filename row)
   :date_created (:date_created row)
   :created_by (:email_address row)
   :primitive_text_data (get-primitive-data "text" (:data_set_id row))})


; format the specified row from the data_set table
(defn- format-data-set [row]
  {:uuid (:uuid row)
   :date_created (:date_created row)
   :created_by (:email_address row)
   :data (flatten [(get-attachment-data (:id row))
                   (get-primitive-data "boolean" (:id row))
                   (get-primitive-data "date" (:id row))
                   (get-primitive-data "integer" (:id row))
                   (get-primitive-data "real" (:id row))
                   (get-primitive-data "text" (:id row))])})


; format the specified row from the data_set_attachement table
(defn- format-data-set-attachment [row]
  {:uuid (:uuid row)
   :date_created (:date_created row)
   :created_by (:email_address row)
   :location (:location row)
   :client (:client row)
   :attachments (flatten [(get-attachment-data (:id row)) ])
   :primitive_text_data (get-primitive-data "text" (:id row))})


; format the specified attachment from the data_set_attachment table
(defn- format-attachment [row]
  (->
    {:body (java.io.ByteArrayInputStream. (:contents row))}
    (content-type (:mime_type row))
    (header "Content-Length" (:bytes row))
    (header "Content-Disposition" (str "attachment;filename='"
                                       (:filename row)
                                       "'"))))

(def data-set-query
  (str "select "
       "  ds.id, "
       "  ds.uuid, "
       "  ds.date_created, u.email_address, "
       "  cl.description as location, "
       "  c.name as client "
       "from public.data_set ds "
       "inner join public.user u "
       "  on u.id = ds.created_by "
       "left join public.client_location cl "
       "  on ds.client_location_id = cl.id "
       "left join public.client c "
       "  on c.id = cl.client_id "
       "where ds.date_deleted is null "))

(def data-set-attachment-info-query
  (str "select dsa.filename, dsa.date_created, u.email_address, dsa.data_set_id "
       "from public.data_set_attachment dsa "
       "inner join public.data_set ds on dsa.data_set_id = ds.id "
       "inner join public.user as u on u.id = dsa.created_by "
       "where ds.uuid::character varying=? "
       "and dsa.filename =? "))

(def data-set-attachment-query
  (str "select a.filename, a.mime_type, a.contents, "
       "  octet_length(a.contents) as bytes "
       "from public.data_set_attachment a "
       "inner join public.data_set ds "
       "  on ds.id = a.data_set_id "
       "inner join public.user u "
       "  on u.id = ds.created_by "
       "where a.date_deleted is null "
       "and ds.date_deleted is null "
       "and uuid::character varying=? "
       "and a.filename=? "))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                EXTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; get the specified data set by date
(defn data-get
  [email-address uuid]

  ; log the activity in the session
  (log-detail email-address
              constants/session-activity
              (str constants/session-get-dataset " " uuid))

  (let [access (set (get-user-access email-address))
        can-access (contains? access constants/manage-data)
        can-access-own (contains? access constants/view-own-data)
        query (str data-set-query " and uuid::character varying=?")
        query-own (str query " and u.email_address=?")]
    (if can-access
      (response {:response (first (sql/query (db)
                                             [query uuid]
                                             :row-fn format-data-set))})
      ; if the user cannot access all data, try to at least show them their own
      ; data instead
      (if can-access-own
        (response {:response (first (sql/query (db)
                                               [query-own uuid email-address]
                                               :row-fn format-data-set))})
        (access-denied constants/manage-data)))))


; delete the specified data set by date
(defn data-delete
  [email-address uuid]

  ; log the activity in the session
  (log-detail email-address
              constants/session-activity
              (str constants/session-delete-dataset " " uuid))

  (let [access (set (get-user-access email-address))
        can-access (contains? access constants/manage-data)
        query (str "update public.data_set ds "
                   "set date_deleted=now(), deleted_by="
                   "(select id from public.user where email_address=?) "
                   "where uuid::character varying=? "
                   "and ds.date_deleted is null")]
    (if can-access
      (if (sql/execute! (db) [query email-address uuid])
        (status (response {:response "OK"}) 200 )
        (status (response {:response "Failure"}) 409))
      (access-denied constants/manage-data))))


; submit data
(defn data-submit
  [email-address uuid date-created created-by data]

  ; log the activity in the session
  (log-detail email-address
              constants/session-activity
              (str constants/session-add-dataset " " uuid))

  (let [access (set (get-user-access email-address))
        can-access (or (contains? access constants/create-data)
                       (contains? access constants/manage-data))
        query (str "insert into public.data_set "
                   "(uuid, date_created, created_by) values "
                   "(?::uuid, ?::timestamp with time zone, ("
                   " select id from public.user where email_address=?"
                   "))")
        json-data (try
                    (parse-string data true)
                    (catch Exception e
                      (println (str "Failed to parse 'data' as JSON string"))
                      ; return an empty data-set
                      []))]
    (if can-access
      (if (empty? json-data)
        (status (response {:response "Cannot record empty data-set"}) 409)
        (try
          (let [keys (sql/db-do-prepared-return-keys (db) query [uuid
                                                               date-created
                                                               created-by])
                id (:id keys)]
            ; iterate child elements of 'data' and add to the database also
            (doseq [data-element json-data]
              (let [type (:type data-element)]
                ; treat attachments and primitive data differently
                (if (= type "attachment")
                  ;TODO replace with data-submit-attachment
                  (let [filename (:filename data-element)
                        mime-type (:mime_type data-element)
                        contents (:contents data-element)
                        query (str "insert into public.data_set_attachment "
                                   "(data_set_id, filename, mime_type, contents) "
                                   "values (?,?,?,decode(?, 'base64'))")
                        success (sql/execute! (db) [query id filename mime-type
                                                  contents])]
                    (if (not success)
                      (throw Exception "Failed to insert new attachment!")))
                  ;TODO replace with data-submit-primitve
                  (let [type (:type data-element)
                        description (:description data-element)
                        value (:value data-element)
                        query (str "insert into public.data_set_" type " "
                                   "(data_set_id, description, value) values "
                                   "(?,?,?"
                                   (if (= type "date") ; cast dates correctly
                                     "::timestamp with time zone"
                                     "")
                                   ")")
                        success (sql/execute! (db)
                                              [query id description value])]
                    (if (not success)
                      (throw Exception "Failed to insert new child row!"))))))
            (let [data-saved (data-get email-address uuid)]
              ; broadcast the dataset including attachment binary data to
              ; listeners
              (let [with-attachments (merge (:response (:body data-saved))
                                            {:data json-data})]
                (amqp/broadcast "text/json"
                                "dataset"
                                (generate-string with-attachments)))
              (status data-saved 201)))
          (catch Exception e
            ; TODO -- rollback the transaction
            (println (.getMessage e))
            (if (.getNextException e)
              (println (.getMessage (.getNextException e))))
            (status (response {:response "Failure"}) 409))))
      (access-denied constants/create-data))))

(defn data-submit-attachment
  [data-element data-set-id]
  (let [filename (:filename data-element)
        mime-type (:mime_type data-element)
          contents (:contents data-element)
          query (str "insert into public.data_set_attachment "
                     "(data_set_id, filename, mime_type, contents) "
                     "values (?,?,?,decode(?, 'base64'))")
          success (sql/execute! (db) [query data-set-id filename mime-type
                                    contents])]
      (if (not success)
        (throw Exception "Failed to insert new attachment!"))))

(defn data-submit-primitive
  [data-element data-set-id]
  (let [type (:type data-element)
        description (:description data-element)
          value (:value data-element)
          query (str "insert into public.data_set_" type " "
                     "(data_set_id, description, value) values "
                     "(?,?,?"
                     (if (= type "date") ; cast dates correctly
                       "::timestamp with time zone"
                       "")
                     ")")
          success (sql/execute! (db)
                                [query data-set-id description value])]
      (if (not success)
        (throw Exception "Failed to insert new primitive data!"))))

; list up to 10 data items in the database, as an HTTP response
(defn data-list
  [email-address]

  ; log the activity in the session
  (log-detail email-address
              constants/session-activity
              constants/session-list-datasets)

  (let [access (set (get-user-access email-address))
        can-access (or (contains? access constants/manage-data))
        can-access-own (contains? access constants/view-own-data)
        query (str data-set-query
                   "order by ds.date_created desc "
                   "limit 10")
        query-own (str data-set-query
                       "and u.email_address=? "
                       "order by ds.date_created desc "
                       "limit 10")]
    (if can-access
      (response {:response (sql/query (db) [query] :row-fn format-data-set)})
      ; if the user cannot access all data, try to at least show them their own
      ; data instead
      (if can-access-own
        (response {:response (sql/query (db)
                                        [query-own email-address]
                                        :row-fn format-data-set)})
        (access-denied constants/manage-data)))))

; list datasets having attachments in the database, as an HTTP response
(defn data-list-with-attachments
  [email-address]

  ; log the activity in the session
  (log-detail email-address
              constants/session-activity
              constants/session-list-datasets)

  (let [access (set (get-user-access email-address))
        can-access (or (contains? access constants/manage-data))
        can-access-own (contains? access constants/view-own-data)
        query (str data-set-query
                   "order by ds.date_created desc")
        query-own (str data-set-query
                       "and u.email_address=? "
                       "order by ds.date_created desc")]
    (if can-access
      (response {:response (sql/query (db)
                                      [query]
                                      :row-fn format-data-set-attachment )})
      ; if the user cannot access all data, try to at least show them their own
      ; data instead
      (if can-access-own
        (response {:response (try (sql/query (db)
                                        [query-own email-address]
                                        :row-fn format-data-set-attachment )
                               (catch Exception e
                                 (if (instance? SQLException e)
                                   (do (.getCause e)
                                       (println (.getNextException e)))
                                   (println (.getMessage e)))
                                 false))})
        (access-denied constants/manage-data)))))


; get data_set_attachment info
(defn get-attachment-info
  [email-address uuid filename]

  ; log the activity in the session
  (log-detail email-address
              constants/session-activity
              constants/session-list-datasets)

  (let [access (set (get-user-access email-address))
        can-access (or (contains? access constants/manage-data))
        can-access-own (contains? access constants/view-own-data)
        query data-set-attachment-info-query
        query-own (str data-set-attachment-info-query "and u.email_address=? ")]
    (if can-access
           (response {:response (sql/query
                                  (db)
                                  [query uuid filename]
                                  :row-fn format-data-attachment-info)})
           ; if the user cannot access all data, try to at least show them their
           ; own data instead
           (if can-access-own
             (response {:response (sql/query
                                    (db)
                                    [query-own email-address]
                                    :row-fn format-data-attachment-info)})
             (access-denied constants/manage-data)))))


; get the specified attachment to a data set, by date and filename
(defn data-get-attachment
  [email-address uuid filename]

  ; log the activity in the session
  (log-detail email-address
              constants/session-activity
              (str constants/session-get-dataset-attachment " "
                   uuid " " filename))

  (let [access (set (get-user-access email-address))
        can-access (or (contains? access constants/manage-attachments)
                       (contains? access constants/manage-attachments))
        can-access-own (contains? access constants/view-own-data)
        query-own (str data-set-attachment-query " and u.email_address=?")]
    (if can-access
      (first (sql/query (db)
                        [data-set-attachment-query uuid filename]
                        :row-fn format-attachment))
      ; if the user cannot access all attachments, try to show them the
      ; attachment if this is their data set
      (if can-access-own
        (first (sql/query (db)
                          [query-own uuid filename email-address]
                          :row-fn format-attachment))
        (access-denied constants/manage-data)))))

; delete the specified data set attachment by dataset uuid and filename
(defn data-delete-attachment
  [email-address uuid filename]
  ;TODO check if uuid and filename exits otherwise throw exception

  ; log the activity in the session
  (log-detail email-address
              constants/session-activity
              (str constants/session-delete-dataset-attachment " " uuid))

  (let [access (set (get-user-access email-address))
        can-access (contains? access constants/manage-data)
        query (str "update public.data_set_attachment "
                   "set date_deleted=now(), deleted_by="
                   "(select id from public.user where email_address=?) "
                   "where data_set_id="
                   "(select id from public.data_set where uuid::character varying=? ) "
                   "and filename=? "
                   "and date_deleted is null")]
    (if can-access
      (if (try (sql/execute! (db) [query email-address uuid filename])
             (catch Exception e
               (if (instance? SQLException e)
                 (do (.getCause e)
                     (println (.getNextException e)))
                 (println (.getMessage e)))
               false))
        (status (response {:response "OK"}) 200 )
        (status (response {:response "Failure"}) 409))
      (access-denied constants/manage-data))))

; rename the specified data set attachment filename
(defn data-rename-attachment-filename
  [email-address uuid filename new-filename]

  ; log the activity in the session
  (log-detail email-address
              constants/session-activity
              (str constants/session-rename-dataset-attachment " " uuid))

  (let [access (set (get-user-access email-address))
        can-access (contains? access constants/manage-data)
        query (str "update public.data_set_attachment "
                   "set filename=? "
                   "where data_set_id=("
                   "  select id from public.data_set "
                   "  where uuid::character varying=?) "
                   "and filename=? "
                   "and date_deleted is null")]
    (if can-access
      (if (try (sql/execute! (db) [query new-filename uuid filename])
            (catch Exception e
              (if (instance? SQLException e)
                (do (.getCause e)
                    (println (.getNextException e)))
                (println (.getMessage e)))
              false))
        (status (response {:response "OK"}) 200 )
        (status (response {:response "Failure"}) 409))
      (access-denied constants/manage-data))))
