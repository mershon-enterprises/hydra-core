(ns web-service.constants)

;
; access level constants
;
(def create-attachments "Create Attachments")
(def create-data "Create Data")

(def manage-attachments "Manage Attachments")
(def manage-clients "Manage Clients")
(def manage-data "Manage Data")
(def manage-users "Manage Users")

(def view-attachments "View Attachments")
(def view-clients "View Clients")
(def view-same-client-data "View Same Client Data")
(def view-same-client-location-data "View Same Client Location Data")
(def view-own-data "View Own Data")

;
; session activity constants
;
(def session-activity "activity")
(def session-add-user-access "add user access")
(def session-get-user "get user")
(def session-get-user-access "get user access")
(def session-list-users "list users")
(def session-add-client "add client")
(def session-get-client "get client")
(def session-list-clients "list clients")
(def session-list-client-locations "list client locations")
(def session-add-client-location "add client location")
(def session-add-dataset "add dataset")
(def session-get-dataset "get dataset")
(def session-get-dataset-attachment "get dataset attachment")
(def session-delete-dataset "delete dataset")
(def session-list-datasets "list datasets")
