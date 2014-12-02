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



; format the specified row from the data_set table
(defn- format-data-set [row]
  {:uuid (:uuid row)
   :date_created (:date_created row)
   :created_by (:email_address row)
   :location (:location row)
   :client (:client row)
   :data (flatten [(get-attachment-data (:id row))
                   (get-primitive-data "boolean" (:id row))
                   (get-primitive-data "date" (:id row))
                   (get-primitive-data "integer" (:id row))
                   (get-primitive-data "real" (:id row))
                   (get-primitive-data "text" (:id row))])})


; format the specified row from the data_set_attachment info display
(defn- format-attachment-info [row]
  {:filename (:filename row)
   :date_created (:date_created row)
   :created_by (:email_address row)
   :data (get-primitive-data "text" (:data_set_id row))})


; format the specified attachment from the data_set_attachment download
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
       "  ds.date_created as date_created, "
       "  u.email_address as email_address, "
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

(def data-set-attachment-query
  (str "select "
       "  a.filename as filename, "
       "  a.date_created as date_created, "
       "  u.email_address as email_address, "
       "  a.data_set_id, "
       "  a.mime_type, "
       "  a.contents, "
       "  octet_length(a.contents) as bytes "
       "from public.data_set_attachment a "
       "inner join public.data_set ds "
       "  on ds.id = a.data_set_id "
       "inner join public.user u "
       "  on u.id = ds.created_by "
       "where a.date_deleted is null "
       "and ds.date_deleted is null "))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                EXTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; get the specified data_set set by date
(defn data-set-get
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


; delete the specified data_set by date
(defn data-set-delete
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
(defn data-set-submit
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
            (let [data-saved (data-set-get email-address uuid)]
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

(defn data-set-attachment-submit
  [email-address data-set-uuid data-element]

  (log-detail email-address constants/session-activity
              (str constants/session-add-dataset-attachment
                   " to dataset(" data-set-uuid ")"))

  (let [access (set (get-user-access email-address))
        can-access (contains? access constants/manage-data)
        filename (:filename data-element)
        mime-type (:mime_type data-element)
        contents (:contents data-element)
        query (str "insert into public.data_set_attachment "
                   "(data_set_id, filename, mime_type, contents) "
                   "values ("
                   "(select id from data_set where uuid::character varying=?)"
                   ",?,?,decode(?, 'base64'))")]
    (if can-access
      (if (sql/execute! (db) [query data-set-uuid filename mime-type contents])
        (status (response {:response "OK"}) 200 )
        (status (response {:response "Failure"}) 409))
      (access-denied constants/manage-data))))

(defn data-set-primitive-submit
  [email-address data-set-uuid type description value]

  (log-detail email-address constants/session-activity
              (str constants/session-add-dataset-primitive
                   "(" type ") to dataset(" data-set-uuid ")"))

  (let [access (set (get-user-access email-address))
        can-access (contains? access constants/manage-data)
        query (str "insert into public.data_set_" type " ( "
                   "  data_set_id, created_by, description, value) "
                   "values( "
                   "  (select id from data_set where uuid::character varying=?), "
                   "  (select id from public.user where email_address=?), "
                   "  ?,? "
                   (if (= type "date") ; cast dates correctly
                     "::timestamp with time zone"
                     "")
                   ")")]
    (if can-access
      (if (sql/execute! (db)
                        [query data-set-uuid email-address description value])
        (status (response {:response "OK"}) 200 )
        (status (response {:response "Failure"}) 409))
      (access-denied constants/manage-data))))

(defn data-set-primitive-update
  [email-address data-set-uuid type description value]

  (log-detail email-address constants/session-activity
              (str constants/session-update-dataset-primitive
                   "(" type ") from dataset(" data-set-uuid ")"))

  (let [access (set (get-user-access email-address))
        can-access (contains? access constants/manage-data)
        query (str "update into public.data_set_" type " "
                   "set value=? "
                   "where data_set_id= "
                   "  (select id from data_set where uuid::character varying=?) "
                   "and description=?")]

    (if can-access
      (if (sql/execute! (db) [query value data-set-uuid description])
        (status (response {:response "OK"}) 200 )
        (status (response {:response "Failure"}) 409))
      (access-denied constants/manage-data))))

(defn data-set-primitive-delete
  [email-address data-set-uuid type description]

  (log-detail email-address constants/session-activity
              (str constants/session-delete-dataset-primitive
                   "(" type ") from dataset(" data-set-uuid ")"))

  (let [access (set (get-user-access email-address))
        can-access (contains? access constants/manage-data)
        query (str "update public.data_set_" type " "
                   "set "
                   "  date_deleted=now(), "
                   "  deleted_by=( "
                   "    select id from public.user where email_address=?) "
                   "where data_set_id=( "
                   "  select id from data_set where uuid::character varying=?) "
                   "and description=?")]
    (if can-access
      (if (sql/execute! (db) [query email-address data-set-uuid description])
        (status (response {:response "OK"}) 200 )
        (status (response {:response "Failure"}) 409))
      (access-denied constants/manage-data))))

; list up data_sets in the database, as an HTTP response
(defn data-set-list
  ([email-address]

   ; log the activity in the session
   (log-detail email-address
               constants/session-activity
               constants/session-list-datasets)

   (let [access (set (get-user-access email-address))
         can-access (or (contains? access constants/manage-data))
         can-access-own (contains? access constants/view-own-data)
         query (str data-set-query
                   "order by ds.date_created desc ")
         query-own (str data-set-query
                        "and u.email_address=? "
                        "order by ds.date_created desc ")]
     (if can-access
       (response {:response (sql/query (db) [query] :row-fn format-data-set)})
       ; if the user cannot access all data, try to at least show them their own
       ; data instead
       (if can-access-own
         (response {:response (sql/query (db)
                                         [query-own email-address]
                                         :row-fn format-data-set)})
         (access-denied constants/manage-data)))))
  ([email-address search-params]
   ; log the activity in the session
   (log-detail email-address
               constants/session-activity
               constants/session-list-datasets)

   (let [access (set (get-user-access email-address))
         can-access (or (contains? access constants/manage-data))
         can-access-own (contains? access constants/view-own-data)

         orderBy
         (if (:orderBy search-params)
           (str "ORDER BY " (:order_by search-params)
                (if (:order search-params)
                  (str (:order search-params) " ")
                  "DESC "))
           " ")

         limit
         (if (:limit search-params)
           (str "LIMIT " (:limit search-params) " ") " ")

         offset
         (if (:offset search-params)
           (str "OFFSET" (:offset search-params) " ") " ")

         query (str data-set-query
                   "order by ds.date_created desc ")
         query-own (str data-set-query
                        "and u.email_address=? "
                        orderBy
                        limit
                        offset)]
     (if can-access
       (response {:response (sql/query (db) [query] :row-fn format-data-set)})
       ; if the user cannot access all data, try to at least show them their own
       ; data instead
       (if can-access-own
         (response {:response (sql/query (db)
                                         [query-own email-address]
                                         :row-fn format-data-set)})
         (access-denied constants/manage-data))))))

; get data_set_attachment info
(defn data-set-attachment-info-get
  [email-address uuid filename]

  ; log the activity in the session
  (log-detail email-address
              constants/session-activity
              constants/session-list-datasets)

  (let [access (set (get-user-access email-address))
        can-access (or (contains? access constants/manage-data))
        can-access-own (contains? access constants/view-own-data)
        query data-set-attachment-query
        query-own (str data-set-attachment-query
                       "and u.email_address=? "
                       "and uuid::character varying=? "
                       "and a.filename=? ")]
    (if can-access
           (response {:response (sql/query
                                  (db)
                                  [query uuid filename]
                                  :row-fn format-attachment-info)})
           ; if the user cannot access all data, try to at least show them their
           ; own data instead
           (if can-access-own
             (response {:response (sql/query
                                    (db)
                                    [query-own email-address]
                                    :row-fn format-attachment-info)})
             (access-denied constants/manage-data)))))


; get the specified attachment to a data set, by date and filename
(defn data-set-attachment-get
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
        query-own (str data-set-attachment-query
                       "and u.email_address=? "
                       "and uuid::character varying=? "
                       "and a.filename=? ")]
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
(defn data-set-attachment-delete
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
(defn data-set-attachment-filename-rename
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
