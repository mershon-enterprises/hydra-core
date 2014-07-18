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

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;                                EXTERNAL APIS                                 ;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

; list up to 10 data items in the database, as an HTTP response
(defn data-list
  [session]
  (let [can-access (or (has-access session constants/manage-data))
        query (str "select ds.id, ds.date_created, u.email_address "
                   "from public.data_set ds "
                   "inner join public.user u "
                   "  on u.id = ds.created_by "
                   "where ds.date_deleted is null "
                   "limit 10")
        row-fn (fn [row]
                 {:date_created (:date_created row)
                  :created_by (:email_address row)
                  :data (flatten [(get-primitive-data "boolean" (:id row))
                                  (get-primitive-data "date" (:id row))
                                  (get-primitive-data "integer" (:id row))
                                  (get-primitive-data "real" (:id row))
                                  (get-primitive-data "text" (:id row))])})]
    (if can-access
      (response (sql/query db [query] :row-fn row-fn))
      (access-denied constants/manage-data))))
