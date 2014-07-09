hydra-core
=======================

Cloud-based Application for the Extraction of in-field Datafiles

Overview
--

This is a [Clojure](http://clojure.org) on
[Compojure](https://github.com/weavejester/compojure) web service REST API.

API
--
### GET
#### `/user/list`
* lists the emails of the users
* request:

    ```json
    { /* any content */ }
    ```
* response:

    ```json
    {
      emails: [
        "kevin@slixbits.com",
        "brent@slixbits.com"
      ]
    }
    ```

#### `/version`
* output the current version
* request:

    ```json
    { /* any content */ }
    ```
* response:

    ```json
    {
      version: "0.1.0"
    }
    ```

### POST
#### `/user/register`
* registers an email for a user
* request:

    ```json
    { email_address: "contact@slixbits.com" }
    ```
* response:

    ```json
    { success: true }
    ```

Getting Started
--
1. Install [leiningen](http://leiningen.org/) and make sure the `lein` command
   is on your system path
1. Run the command `lein ring server`
