hydra-core
=======================

Cloud-based Application for the Extraction of in-field Datafiles

Overview
--

This is a [Clojure](http://clojure.org) on
[Compojure](https://github.com/weavejester/compojure) web service REST API.

Table of Contents
--
1. [/access-levels](#accesslevels) - manage global access levels
1. [/users](#users)  - manage users
1. [/version](#version) - get the version of the API

API
--
### `/access-levels`
#### GET
lists all the the access levels in the system
* response:

    ```json
    [
      "Add User Access",
      "Add Users"
    ]
    ```
#### PUT
not allowed
#### POST
add an access level
* sample request:

    ```json
    {
      description: "View Reports"
    }
    ```
* sample response:

    ```json
    {
      "description": "View Reports",
      "date_modified": "2014-07-15T15:12:07Z",
      "date_created": "2014-07-15T15:12:07Z",
      "id": 2
    }
    ```

### `/version`
#### GET
output the current version
* response:

    ```json
    {
      version: "0.1.0"
    }
    ```
#### PUT
not allowed
#### POST
not allowed
#### DELETE
not allowed

Getting Started
--
1. Install [leiningen](http://leiningen.org/) and make sure the `lein` command
   is on your system path
1. Run the command `lein ring server`
