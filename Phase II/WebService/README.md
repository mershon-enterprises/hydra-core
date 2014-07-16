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
      "Add User Access",
      "Add Users"
    ]
    ```

  * #### PUT

    update-all access levels not allowed

  * #### POST

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

    update access level not implemented

  * #### POST

    [same as `/access-levels/`](#post)

  * #### DELETE

    delete access level not allowed

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

    * sample response (url `/access-levels/ryan@slixbits.com`):

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

    [same as `/users/`](#post-4)

  * #### DELETE

    delete user not allowed

<hr/>
### `/users/[email address]/access`

  * #### GET

    get details of the specified user's access

    * sample response (url `/access-levels/ryan@slixbits.com/access`):

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
