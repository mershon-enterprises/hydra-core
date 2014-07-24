(ns web-service.data
  (:use [ring.util.response]
        [web-service.db]
        [web-service.session])
  (:require [clojure.java.jdbc :as sql]
            [web-service.constants :as constants]
            [clojure.data.json :as json]))

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
  {:date_created (:date_created row)
   :created_by (:email_address row)
   :data (flatten [(get-attachment-data (:id row))
                   (get-primitive-data "boolean" (:id row))
                   (get-primitive-data "date" (:id row))
                   (get-primitive-data "integer" (:id row))
                   (get-primitive-data "real" (:id row))
                   (get-primitive-data "text" (:id row))])})


(def data-set-query
  (str "select ds.id, ds.date_created, u.email_address "
       "from public.data_set ds "
       "inner join public.user u "
       "  on u.id = ds.created_by "
       "where ds.date_deleted is null "))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                EXTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


; get the specified data set by date
(defn data-get
  [session date-created]
  (let [can-access (has-access session constants/manage-data)
        can-access-own (has-access session constants/view-own-data)
        query (str data-set-query
                   " and date_trunc('second', ds.date_created)="
                   "?::timestamp with time zone")
        query-own (str query " and u.email_address=? limit 10")]
    (if can-access
      (response (sql/query db [query date-created] :row-fn format-data-set))
      ; if the user cannot access all data, try to at least show them their own
      ; data instead
      (if can-access-own
        (response (sql/query db
                             [query-own date-created (:email-address session)]
                             :row-fn format-data-set))
        (access-denied constants/manage-data)))))


; delete the specified data set by date
(defn data-delete
  [session date-created]
  (let [can-access (has-access session constants/manage-data)
        query (str "update public.data_set ds "
                   "set date_deleted=now(), deleted_by="
                   "(select id from public.user where email_address=?) "
                   "where date_trunc('second', ds.date_created)="
                   "?::timestamp with time zone "
                   "and ds.date_deleted is null")]
    (if can-access
      (if (sql/execute! db [query (:email-address session) date-created])
        {:status 204}
        {:status 409})
      (access-denied constants/manage-data))))


; submit data
(defn data-submit
  [session date-created created-by data]
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
            (status (data-get session date-created) 201))
          (catch Exception e
            ; TODO -- rollback the transaction
            (println (.getMessage e))
            (println (.getMessage (.getNextException e)))
            {:status 409})))
      (access-denied constants/create-data))))


; list up to 10 data items in the database, as an HTTP response
(defn data-list
  [session]
  (let [can-access (or (has-access session constants/manage-data))
        can-access-own (has-access session constants/view-own-data)
        query (str data-set-query "limit 10")
        query-own (str data-set-query "and u.email_address=? limit 10")]
    (if can-access
      (response (sql/query db [query] :row-fn format-data-set))
      ; if the user cannot access all data, try to at least show them their own
      ; data instead
      (if can-access-own
        (response (sql/query db
                             [query-own (:email-address session)]
                             :row-fn format-data-set))
        (access-denied constants/manage-data)))))
