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
1. [/admin-authenticate](#admin-authenticate) - domain admin authentication to the API on behalf of a user
1. [/authenticate](#authenticate) - user authentication to the API
1. [/clients](#clients) - manage clients
1. [/data](#data) - manage data
1. [/users](#users) - manage users
1. [/version](#version) - get the version of the API

API
--
### `/access-levels`

  * #### GET

    lists all the access levels in the system

    * sample request:

      url: `/access-levels?api_token=[[api token]]`

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T14:47:23Z",
        "token": "[[api token]]",
        "response": [
          "Create Attachments",
          "Create Data",
          "Manage Attachments",
          "Manage Clients",
          "Manage Data",
          "Manage Users",
          "View Attachments",
          "View Clients",
          "View Same Client Data",
          "View Same Client Location Data",
          "View Own Data"
        ]
      }
      ```

  * #### PUT

    update-all access levels not allowed

  * #### POST

    create access level not allowed

  * #### DELETE

    delete-all access levels not allowed

<hr/>
### `/access-levels/[[description]]`
  * #### GET

    get details of the specified access level

    * sample request:

      url: `/access-levels/Manage Users?api_token=[[api token]]`

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T14:50:04Z",
        "token": "[[api token]]",
        "response": {
          "description": "Manage Users",
          "date_modified": "2014-08-13T22:05:27Z",
          "date_created": "2014-08-13T22:05:27Z"
        }
      }
      ```

  * #### PUT

    update access level not allowed

  * #### POST

    create access level not allowed

  * #### DELETE

    delete access level not allowed

<hr/>
### `/admin-authenticate`
  * #### POST

    Authenticate to the system on behalf of another user, and obtain a one-time-use api token. The user providing credentials must be a member of the Domain Admins group in the LDAP server.
    Every subsequent request will return a new api token, and every request requires a token as a parameter.

    * sample request:

      ```json
      {
        "email_address": "admin@example.com",
        "password": "nunyabidness",
        "user_email_address": "basicuser@example.com"
      }
      ```

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T14:39:12Z",
        "token": "[[api token]]",
        "response": {
          "email_address": "basicuser@example.com",
          "first_name": "Richard",
          "last_name": "Henderson",
          "access": [
            "Create Attachments",
            "Create Data",
            "Manage Users",
            "View Clients"
          ]
      }
      ```

<hr/>
### `/authenticate`
  * #### POST

    Authenticate to the system and obtain a one-time-use api token. The user must exist in the LDAP server.
    Every subsequent request will return a new api token, and every request requires a token as a parameter.

    * sample request:

      ```json
      {
        "email_address": "admin@example.com",
        "password": "nunyabidness"
      }
      ```

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T14:39:12Z",
        "token": "[[api token]]",
        "response": {
          "email_address": "admin@example.com",
          "first_name": "PI VPN",
          "last_name": null,
          "access": [
            "Manage Attachments",
            "Manage Clients",
            "Manage Data",
            "Manage Users"
          ]
      }
      ```

<hr/>
### `/clients`
  * #### GET

    lists all the clients in the system

    * sample request:

      url: `/clients?api_token=[[api token]]`

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T14:55:57Z",
        "token": "[[api token]]",
        "response": [
          "Aera Energy",
          "Chevron",
          "Occidental Petroleum"
         ]
      }
      ```

  * #### PUT

    update-all clients not allowed

  * #### POST

    add a client

    * sample request:

      ```json
      {
        "api_token": "[[api token]]",
        "name": "Occidental Petroleum"
      }
      ```

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T14:55:57Z",
        "token": "[[api token]]",
        "response": {
          "name": "Occidental Petroleum",
          "date_modified": "2014-07-15T15:12:07Z",
          "date_created": "2014-07-15T15:12:07Z"
         }
      }
      ```

  * #### DELETE

    delete-all clients not allowed

<hr/>
### `/clients/[[name]]`

  * #### GET

    get details of the specified client

    * sample request:

      url: `/clients/Chevron?api_token=[[api token]]`

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T14:59:57Z",
        "token": "[[api token]]",
        "response": {
          "name": "Chevron",
          "date_modified": "2014-08-13T22:05:27Z",
          "date_created": "2014-08-13T22:05:27Z"
        }
      }
      ```

  * #### PUT

    update client not implemented

  * #### POST

    [same as `/clients`](#post-4)

  * #### DELETE

    delete client not allowed

<hr/>
### `/clients/[[name]]/locations`

  * #### GET

    get details of the specified clients's locations

    * sample request:

      url: `/clients/Chevron/locations?api_token=[[api token]]`

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T15:02:49Z",
        "token": "[[api token]]",
        "response": [
          "Kern River"
        ]
      }
      ```

  * #### PUT

    update-all client locations not allowed

  * #### POST

    add a location to the specified client

    * sample request:

      ```json
      {
        "api_token": "[[api token]]",
        "description": "Cymric"
      }
      ```

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T15:03:08Z",
        "token": "[[api token]]",
        "response": [
          "Cymric",
          "Kern River"
        ]
      }
      ```

  * #### DELETE

    delete-all client locations not allowed

<hr/>
### `/data`
  * #### GET

    lists the last 10 data sets in the system

    * sample request:

      url: `/data?api_token=[[api token]]`

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T15:07:12Z",
        "token": "[[api token]]",
        "response": {
          "uuid": "7fa1f8f6-498d-4054-9300-4fcd4fa6bb57",
          "date_created": "2014-08-13T22:05:27Z",
          "created_by": "admin@example.com",
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
      }
      ```

  * #### PUT

    update-all data not allowed

  * #### POST

    add a set of data

    * sample request:

      ```json
      {
        "api_token": "[[api token]]",
        "uuid": "943128ec-0f7a-4edc-9241-46cf31c41df0",
        "date_created": "2014-07-18T19:51:01Z",
        "created_by": "manager@example.com",
        "data": [
          {
            "value": false,
            "description": "Reconciled",
            "type": "boolean"
          },
          {
            "value": "2014-07-28T07:00:00Z",
            "description": "start date",
            "type": "date"
          },
          {
            "value": 99.99,
            "description": "cost",
            "type": "real"
          }
        ]
      }
      ```

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T15:07:12Z",
        "token": "[[api token]]",
        "response": {
          "uuid": "943128ec-0f7a-4edc-9241-46cf31c41df0",
          "date_created": "2014-07-18T19:51:01Z",
          "created_by": "manager@example.com",
          "data": [
            {
              "value": false,
              "description": "Reconciled",
              "type": "boolean"
            },
            {
              "value": "2014-07-28T07:00:00Z",
              "description": "start date",
              "type": "date"
            },
            {
              "value": 99.99,
              "description": "cost",
              "type": "real"
            }
          ]
        }
      }
      ```

  * #### DELETE

    delete-all data not allowed

<hr/>
### `/data/[[uuid]]`

  * #### GET

    get details of the specified data set

    * sample request:

      url: `/data/943128ec-0f7a-4edc-9241-46cf31c41df0?api_token=[[api token]]`

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T15:07:12Z",
        "token": "[[api token]]",
        "response": {
          "uuid": "943128ec-0f7a-4edc-9241-46cf31c41df0",
          "date_created": "2014-07-18T19:51:01Z",
          "created_by": "manager@example.com",
          "data": [
            {
              "value": false,
              "description": "Reconciled",
              "type": "boolean"
            },
            {
              "value": "2014-07-28T07:00:00Z",
              "description": "start date",
              "type": "date"
            },
            {
              "value": 99.99,
              "description": "cost",
              "type": "real"
            }
          ]
        }
      }
      ```

  * #### PUT

    update data not implemented

  * #### POST

    [same as `/data/`](#post-7)

  * #### DELETE

    delete the data set

<hr/>
### `/users`
  * #### GET

    lists all the users in the system

    * sample request:

      url: `/users?api_token=[[api token]]`

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T15:19:16Z",
        "token": "[[api token]]",
        "response": [
          "admin@example.com",
          "manager@example.com",
          "basicuser@example.com"
        ]
      }
      ```

  * #### PUT

    update-all users not allowed

  * #### POST

    create user not allowed (users are implicitly created after successful authentication via [/authenticate](#authenticate) or [/admin-authenticate](#admin-authenticate)

  * #### DELETE

    delete-all users not allowed

<hr/>
### `/users/[[email address]]`

  * #### GET

    get details of the specified user

    * sample request:

      url: `/users/basicuser@example.com?api_token=[[api token]]`

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T15:22:27Z",
        "token": "[[api token]]",
        "response": {
          "email_address": "basicuser@example.com",
          "date_modified": "2014-08-14T00:30:23Z",
          "date_created": "2014-08-14T00:30:23Z"
        }
      }
      ```

  * #### PUT

    update user not implemented

  * #### POST

    create user not allowed (users are implicitly created after successful authentication via [/authenticate](#authenticate) or [/admin-authenticate](#admin-authenticate)

  * #### DELETE

    delete user not allowed

<hr/>
### `/users/[email address]/access`

  * #### GET

    get details of the specified user's access

    * sample request:

      url: `/users/basicuser@example.com/access?api_token=[[api token]]`

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T15:24:08Z",
        "token": "[[api token]]",
        "response": [
          "Manage Users",
          "View Clients"
        ]
      }
      ```

  * #### PUT

    update-all user access not implemented

  * #### POST

    add access to the specified user

    * sample request:

      ```json
      {
        "api_token": "[[api token]]",
        "description": "Manage Data"
      }
      ```

    * sample response:

      ```json
      {
        "token_expiration_date": "2014-08-21T15:27:37Z",
        "token": "[[api token]]",
        "response": [
          "Manage Data",
          "Manage Users",
          "View Clients"
        ]
      }
      ```

  * #### DELETE

    delete-all user access not allowed

<hr/>
### `/version`

  * #### GET

    output the current version

    * sample request:

      url: `/version`

    * sample response:

      ```json
      {
        "version": "0.2.0"
      }
      ```

Getting Started
--
1. Install [leiningen](http://leiningen.org/) and make sure the `lein` command
   is on your system path
1. Run the command `lein run`
