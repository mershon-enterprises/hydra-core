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
1. [/clients](#clients) - manage clients
1. [/data](#data) - manage data
1. [/login](#login) - login to the system and establish a session
1. [/logout](#logout) - log out of the system
1. [/users](#users) - manage users
1. [/version](#version) - get the version of the API

API
--
### `/access-levels`

  * #### GET

    lists all the access levels in the system

    * sample response:

    ```json
    [
      "Manage Users",
      "Manage Clients"
    ]
    ```

  * #### PUT

    update-all access levels not allowed

  * #### POST

    create access level not allowed

  * #### DELETE

    delete-all access levels not allowed

<hr/>
### `/access-levels/[description]`
  * #### GET

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

  * #### PUT

    update access level not allowed

  * #### POST

    create access level not allowed

  * #### DELETE

    delete access level not allowed

<hr/>
### `/clients`
  * #### GET

    lists all the clients in the system

    * sample response:

    ```json
    [
      "Aera Energy",
      "Chevron"
    ]
    ```

  * #### PUT

    update-all clients not allowed

  * #### POST

    add a client

    * sample request:

    ```json
    {
      name: "Occidental Petroleum"
    }
    ```

    * sample response:

    ```json
    {
      "name": "Occidental Petroleum",
      "date_modified": "2014-07-15T15:12:07Z",
      "date_created": "2014-07-15T15:12:07Z",
      "id": 3
    }
    ```

  * #### DELETE

    delete-all clients not allowed

<hr/>
### `/clients/[name]`

  * #### GET

    get details of the specified client

    * sample response (url `/clients/Chevron`):

    ```json
    {
      "name": "Chevron",
      "date_modified": "2014-07-17T15:59:24Z",
      "date_created": "2014-07-17T15:59:24Z",
      "id": 2
    }
    ```

  * #### PUT

    update client not implemented

  * #### POST

    [same as `/clients`](#post-2)

  * #### DELETE

    delete client not allowed

<hr/>
### `/clients/[name]/locations`

  * #### GET

    get details of the specified clients's locations

    * sample response (url `/clients/Chevron/locations`):

    ```json
    [
      "Kern River"
    ]
    ```

  * #### PUT

    update-all client locations not implemented

  * #### POST

    add a location to the specified client

    * sample request:

    ```json
    {
      description: "Cymric"
    }
    ```

    * sample response:

    ```json
    [
      "Cymric",
      "Kern River"
    ]
    ```

  * #### DELETE

    delete-all client locations not allowed

<hr/>
### `/data`
  * #### GET

    lists the last 10 data sets in the system

    * sample response:

    ```json
    [
      {
        "date_created": "2014-07-18T19:18:57Z",
        "created_by": "kevin@slixbits.com",
        "data": [
            {
                "value": false,
                "description": "Reconciled to QuickBooks",
                "type": "boolean"
            },
            {
                "value": "2014-07-18T16:00:00Z",
                "description": "Start Date",
                "type": "date"
            },
            {
                "value": "2014-07-18T16:30:00Z",
                "description": "End Date",
                "type": "date"
            },
            {
                "value": 0,
                "description": "Duration (hours)",
                "type": "integer"
            },
            {
                "value": 30,
                "description": "Duration (minutes)",
                "type": "integer"
            },
            {
                "value": "Time Log Entry",
                "description": "Description",
                "type": "text"
            },
            {
                "value": "hydra-core",
                "description": "Project",
                "type": "text"
            }
        ]
      },
      /*
       * ...
       *
       * more data sets here
       *
       * ...
       */
    ]
    ```

  * #### PUT

    update-all data not allowed

  * #### POST

    add a set of data

    * sample request:

    ```json
    {
        "date_created": "2014-07-18T19:51:01Z",
        "created_by": "brent@slixbits.com",
        "data": [
            {
                "value": false,
                "description": "Reconciled to QuickBooks",
                "type": "boolean"
            },
            {
                "value": 2,
                "description": "Duration (hours)",
                "type": "integer"
            },
            {
                "value": 30,
                "description": "Duration (minutes)",
                "type": "integer"
            },
            {
                "value": 125,
                "description": "cost",
                "type": "real"
            }
        ]
    }
    ```

  * #### DELETE

    delete-all data not allowed

<hr/>
### `/users/[timestamp with time zone]`

  * #### GET

    get details of the specified data set

    * sample response (url `/data/2014-07-18T19:51:01Z`):

    ```json
    {
        "date_created": "2014-07-18T19:51:01Z",
        "created_by": "brent@slixbits.com",
        "data": [
            {
                "value": false,
                "description": "Reconciled to QuickBooks",
                "type": "boolean"
            },
            {
                "value": 2,
                "description": "Duration (hours)",
                "type": "integer"
            },
            {
                "value": 30,
                "description": "Duration (minutes)",
                "type": "integer"
            },
            {
                "value": 125,
                "description": "cost",
                "type": "real"
            }
        ]
    }
    ```

  * #### PUT

    update data not implemented

  * #### POST

    [same as `/data/`](#post-5)

  * #### DELETE

    delete the data set

<hr/>
### `/login`
  * #### POST

    login to the system and establish a session

    * sample request:

    ```json
    {
      email_address: "brent@slixbits.com",
      password: "nunyabidness"
    }
    ```

<hr/>
### `/logout`
  * #### POST

    log out of the system

<hr/>
### `/users`
  * #### GET

    lists all the users in the system

    * sample response:

    ```json
    [
      "brent@slixbits.com",
      "kevin@slixbits.com"
    ]
    ```

  * #### PUT

    update-all users not allowed

  * #### POST

    add a user

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

  * #### DELETE

    delete-all users not allowed

<hr/>
### `/users/[email address]`

  * #### GET

    get details of the specified user

    * sample response (url `/users/ryan@slixbits.com`):

    ```json
    {
      "email_address": "ryan@slixbits.com",
      "date_modified": "2014-07-15T15:12:07Z",
      "date_created": "2014-07-15T15:12:07Z",
      "id": 3
    }
    ```

  * #### PUT

    update user not implemented

  * #### POST

    [same as `/users/`](#post-9)

  * #### DELETE

    delete user not allowed

<hr/>
### `/users/[email address]/access`

  * #### GET

    get details of the specified user's access

    * sample response (url `/users/ryan@slixbits.com/access`):

    ```json
    [
      "View Reports"
    ]
    ```

  * #### PUT

    update-all user access not implemented

  * #### POST

    add access to the specified user

    * sample request:

    ```json
    {
      description: "Add Users"
    }
    ```

    * sample response:

    ```json
    [
      "Add Users",
      "View Reports"
    ]
    ```

  * #### DELETE

    delete-all user access not allowed

<hr/>
### `/version`

  * #### GET

    output the current version

    * sample response:

    ```json
    {
      version: "0.1.0"
    }
    ```

Getting Started
--
1. Install [leiningen](http://leiningen.org/) and make sure the `lein` command
   is on your system path
1. Run the command `lein ring server`
