(ns web-service.data
  (:use [ring.util.response]
        [web-service.db]
        [web-service.session])
  (:require [clojure.java.jdbc :as sql]
            [web-service.constants :as constants]))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                INTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


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
   :data (flatten [(get-primitive-data "boolean" (:id row))
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
  (let [can-access (or (has-access session constants/manage-data))
        query (str data-set-query
                   " and date_trunc('second', ds.date_created)="
                   "?::timestamp with time zone")]
    (if can-access
      (response (sql/query db [query date-created] :row-fn format-data-set))
      (access-denied constants/manage-data))))


; delete the specified data set by date
(defn data-delete
  [session date-created]
  (let [can-access (or (has-access session constants/manage-data))
        query (str "update public.data_set ds "
                   "set date_deleted=now(), deleted_by="
                   "(select id from public.user where email_address=?) "
                   "where date_trunc('second', ds.date_created)="
                   "?::timestamp with time zone "
                   "and ds.date_deleted is null")]
    (if (sql/execute! db
                      [query (:email-address session) date-created])
      {:status 204}
      {:status 409})))


; list up to 10 data items in the database, as an HTTP response
(defn data-list
  [session]
  (let [can-access (or (has-access session constants/manage-data))
        query (str data-set-query "limit 10")]
    (if can-access
      (response (sql/query db [query] :row-fn format-data-set))
      (access-denied constants/manage-data))))
