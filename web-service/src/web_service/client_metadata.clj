(ns web-service.client-metadata
  (:use [ring.util.response]
        [web-service.db]
        [web-service.session]
        [web-service.user-helpers]
        [web-service.authentication])
  (:require [clojure.java.jdbc :as sql]
            [clojure.string :as string]
            [clojure.tools.logging :as log]
            [clojure.data.codec.base64 :as b64]
            [cheshire.core :refer :all]
            [web-service.amqp :as amqp]
            [hydra.constants :as constants]
            [web-service.schema :as queries :include-macros true])
  (:import java.sql.SQLException
           org.apache.commons.lang.RandomStringUtils))

(defn add-client-metadata!
  [& {:keys [key_name
             client_name
             email_address
             key_value
             ] :as args}]
  {:pre [true] :post [true]} ;FIXME add spec validators
  (log/debug "add-client-metadata!")
  (log/debug "args:   " args)

  (let [access     (set (get-user-access email_address))
        can-access (contains? access constants/manage-clients)]

    (if can-access
      (let [client_metadata (queries/add-client-metadata<!
                              {:client_name   client_name
                               :email_address email_address
                               :key_name      key_name
                               :key_value     key_value}
                              {:result-set-fn first})]

        (if client_metadata
          (response {:response client_metadata})
          (not-found "client metadata not found")))

      (access-denied (str constants/manage-clients)))))

(defn get-client-metadata
  [& {:keys [client_name
             email_address] :as args}]
  {:pre [true] :post [true]} ;FIXME add spec validators
  (log/debug "get-client-metadata")
  (log/debug "args:   " args)

  (let [access          (set (get-user-access email_address))
        can-access      (or (contains? access constants/view-clients)
                            (contains? access constants/manage-clients))
        can-manage-data (contains? access constants/manage-data)

        restrict_email_address (if can-manage-data nil email_address)]

    (if can-access
      (let [client_metadata_list (queries/get-client-metadata-list-by-client-name
                                   {:client_name   client_name
                                    :email_address restrict_email_address})]

        (if (not-empty client_metadata_list)
          (response {:response client_metadata_list})
          (not-found "client metadata not found")))

      (access-denied (str constants/manage-clients)))))

(defn delete-client-metadata!
  [& {:keys [client_name
             email_address
             key_name] :as args}]
  {:pre [true] :post [true]} ;FIXME add spec validators
  (log/debug "delete-client-metadata!")
  (log/debug "args:   " args)

  (let [access     (set (get-user-access email_address))
        can-access (contains? access constants/manage-clients)]

    (if can-access
      (let [deleted_client_metadata (queries/delete-client-metadata<!
                                      {:client_name   client_name
                                       :email_address email_address
                                       :key_name key_name}
                                      {:result-set-fn first})]

        (if deleted_client_metadata
          (response {:response deleted_client_metadata})
          (not-found "client metadata not found")))

      (access-denied (str constants/manage-clients)))))

(defn update-client-metadata!
  [& {:keys [client_name
             email_address
             key_name
             key_value] :as args}]
  {:pre [true] :post [true]} ;FIXME add spec validators
  (log/debug "update-client-metadata!")
  (log/debug "args:   " args)

  (let [conn (db)
        access     (set (get-user-access email_address))
        can-access (contains? access constants/manage-clients)]

    (sql/with-db-transaction
      [conn db-spec]
      (if can-access
        (let [_deleted_client_metadata (queries/delete-client-metadata<!
                                         {:client_name   client_name
                                          :email_address email_address
                                          :key_name key_name})
              update_client_metadata (queries/add-client-metadata<!
                                       {:client_name   client_name
                                        :email_address email_address
                                        :key_name      key_name
                                        :key_value     key_value}
                                       {:result-set-fn first})]

          (if update_client_metadata
            (response {:response update_client_metadata})
            (not-found "client metadata not found")))

        (access-denied (str constants/manage-clients))))))
