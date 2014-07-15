hydra-core
=======================

Cloud-based Application for the Extraction of in-field Datafiles

Overview
--

This is a [Clojure](http://clojure.org) on
[Compojure](https://github.com/weavejester/compojure) web service REST API.

Table of Contents
--
1. [/access-levels](#access-levels) - manage global access levels
1. [/users](#users)  - manage users
1. [/version](#version) - get the version of the API

API
--
### `/access-levels`

#### GET
lists all the access levels in the system
* response:

    ```json
    [
      "Add User Access",
      "Add Users"
    ]
    ```

#### PUT
update-all access levels not allowed

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
      "id": 3
    }
    ```

#### DELETE
delete-all access levels not allowed
    
### `/access-levels/[description]`
#### GET
get details of the specified access level
* sample response (url `/access-levels/View Reports`):

    ```json
    {
      "description": "View Reports",
      "date_modified": "2014-07-15T15:12:07Z",
      "date_created": "2014-07-15T15:12:07Z",
      "id": 3
    }
    ```

#### PUT
update access level not implemented

#### POST
[same as `/access-levels/`](#post)

#### DELETE
delete not allowed

### `/users`
#### GET
lists all the users in the system
* response:

    ```json
    {
      emails: [
        "brent@slixbits.com",
        "kevin@slixbits.com"
      ]
    }
    ```

#### PUT
update-all users not allowed

#### POST
add an access level
* sample request:

    ```json
    {
      email_address: "ryan@slixbits.com"
    }
    ```
* sample response:

    ```json
    {
      "email_address": "ryan@slixbits.com",
      "date_modified": "2014-07-15T15:12:07Z",
      "date_created": "2014-07-15T15:12:07Z",
      "id": 3
    }
    ```

#### DELETE
delete-all users not allowed

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
update version not allowed

#### POST
add version not allowed

#### DELETE
delete version not allowed

Getting Started
--
1. Install [leiningen](http://leiningen.org/) and make sure the `lein` command
   is on your system path
1. Run the command `lein ring server`
