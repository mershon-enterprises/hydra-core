(ns web-service.data
  (:use [ring.util.response]
        [web-service.db]
        [web-service.session]
        [web-service.user-helpers])
  (:require [clojure.java.jdbc :as sql]
            [web-service.constants :as constants]
            [clojure.data.json :as json]
            [web-service.smtp :as smtp]))

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
    (sql/query db [query data-set-id])))


(defn- get-primitive-data
  [type data-set-id]
  (let [query (str "select '" type "' as type, description, value "
                   "from public.data_set_" type " "
                   "where data_set_id=? "
                   "and date_deleted is null")]
    (sql/query db [query data-set-id])))


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
  (str "select ds.id, ds.uuid, ds.date_created, u.email_address "
       "from public.data_set ds "
       "inner join public.user u "
       "  on u.id = ds.created_by "
       "where ds.date_deleted is null "))


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
       "and date_trunc('second', ds.date_created)="
       "  ?::timestamp with time zone "
       "and a.filename=? "))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                EXTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; get the specified data set by date
(defn data-get
  [email-address uuid]

  ; FIXME log the activity in the session
  ; (log-detail session
  ;             constants/session-activity
  ;             (str constants/session-get-dataset " " uuid))

  (let [access (set (get-user-access email-address))
        can-access (contains? access constants/manage-data)
        can-access-own (contains? access constants/view-own-data)
        query (str data-set-query " and uuid::character varying=?")
        query-own (str query " and u.email_address=?")]
    (if can-access
      (response {:response (sql/query db [query uuid] :row-fn format-data-set)})
      ; if the user cannot access all data, try to at least show them their own
      ; data instead
      (if can-access-own
        (response {:response (sql/query db
                                        [query-own uuid email-address]
                                        :row-fn format-data-set)})
        (access-denied constants/manage-data)))))


; delete the specified data set by date
(defn data-delete
  [email-address uuid]

  ; FIXME log the activity in the session
  ; (log-detail session
  ;             constants/session-activity
  ;             (str constants/session-delete-dataset " " date-created))

  (let [access (set (get-user-access email-address))
        can-access (contains? access constants/manage-data)
        query (str "update public.data_set ds "
                   "set date_deleted=now(), deleted_by="
                   "(select id from public.user where email_address=?) "
                   "where uuid::character varying=? "
                   "and ds.date_deleted is null")]
    (if can-access
      (if (sql/execute! db [query email-address uuid])
        (status (response {:response "OK"}) 200 )
        (status (response {:response "Failure"}) 409))
      (access-denied constants/manage-data))))


; submit data
(defn data-submit
  [session date-created created-by data]

  ; log the activity in the session
  (log-detail session
              constants/session-activity
              (str constants/session-add-dataset " " date-created))

  (let [can-access (or (has-access session constants/create-data)
                       (has-access session constants/manage-data))
        query (str "insert into public.data_set "
                   "(date_created, created_by) values "
                   "(?::timestamp with time zone, ("
                   " select id from public.user where email_address=?"
                   "))")]
    (if can-access
      (if (empty? data)
        {:body "Cannot record empty data-set"
         :status 409}
        (try
          (let [keys (sql/db-do-prepared-return-keys db
                                                     query
                                                     [date-created created-by])
                id (:id keys)
                json-data (json/read-str data :key-fn keyword)]
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
                        success (sql/execute! db [query id filename mime-type
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
                        success (sql/execute! db
                                              [query id description value])]
                    (if (not success)
                      (throw Exception "Failed to insert new child row!"))))))
            (smtp/send-message created-by
                               (str "Data Received for " date-created)
                               "[no text]")
            (status (data-get session date-created) 201))
          (catch Exception e
            ; TODO -- rollback the transaction
            (println (.getMessage e))
            (println (.getMessage (.getNextException e)))
            {:status 409})))
      (access-denied constants/create-data))))


; list up to 10 data items in the database, as an HTTP response
(defn data-list
  [email-address]

  ; FIXME log the activity in the session
  ; (log-detail session
  ;             constants/session-activity
  ;             constants/session-list-datasets)

  (let [access (set (get-user-access email-address))
        can-access (or (contains? access constants/manage-data))
        can-access-own (contains? access constants/view-own-data)
        query (str data-set-query "limit 10")
        query-own (str data-set-query "and u.email_address=? limit 10")]
    (if can-access
      (response {:response (sql/query db [query] :row-fn format-data-set)})
      ; if the user cannot access all data, try to at least show them their own
      ; data instead
      (if can-access-own
        (response {:response (sql/query db
                                        [query-own email-address]
                                        :row-fn format-data-set)})
        (access-denied constants/manage-data)))))


; get the specified attachment to a data set, by date and filename
(defn data-get-attachment
  [session date-created filename]

  ; log the activity in the session
  (log-detail session
              constants/session-activity
              (str constants/session-get-dataset-attachment " "
                   date-created " " filename))

  (let [can-access (or (has-access session constants/manage-attachments)
                       (has-access session constants/manage-attachments))
        can-access-own (has-access session constants/view-own-data)
        query-own (str data-set-attachment-query " and u.email_address=?")]
    (if can-access
      (first (sql/query db [data-set-attachment-query
                            date-created
                            filename]
                        :row-fn format-attachment))
      ; if the user cannot access all attachments, try to show them the
      ; attachment if this is their data set
      (if can-access-own
        (first (sql/query db [query-own
                              date-created
                              filename (:email-address session)]
                          :row-fn format-attachment))
        (access-denied constants/manage-data)))))
