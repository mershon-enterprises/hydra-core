Hydra
==
Hydra is a distributed web application designed for generalized data collection and warehousing. Designed from the ground-up to maximize portability, the core doesn't rely on any specific Cloud platform. You can self-host it, host it on a VPS, or host it on Amazon Web Services equally well. The base system comes with a File Explorer interface for easily uploading, finding, and manipulating binary files stored to the system, and the common REST API can be reutilized to implement any kind of custom implementation specific to your domain, such as browser plugins, webapps, and native mobile applications.

Development
==
Developing with Hydra will require the following components:
- [PostgreSQL](https://www.postgresql.org/download/)
  version 9.3 or later
- [RabbitMQ](https://www.rabbitmq.com/)
  if you are going to be developing dependent micro-services (OPTIONAL)
- [Leiningen](http://leiningen.org/)
  for Clojure web-service components
- [NodeJS](https://nodejs.org/en/) (specifically [npm](https://www.npmjs.com/) and [bower](https://bower.io/))
  web-service-front-end components

Getting Started
==
## Installation Instructions
### MacOSX
--
1. Install [homebrew](http://brew.sh/)
2. Install [Leiningen](http://leiningen.org/)
3. Install [NodeJS](https://nodejs.org/en/) with `brew install nodejs` and then run `npm install -g bower grunt-cli`
4. Install [PostgreSQL](http://www.enterprisedb.com/products-services-training/pgdownload#macosx)
  I recommend grabbing [this installer](http://get.enterprisedb.com/postgresql/postgresql-9.3.13-2-osx.dmg) and be sure to write down the username and password you configured
5. (OPTIONAL) Install [RabbitMQ](https://www.rabbitmq.com/) with `brew install rabbitmq` and then you'll either have to run it manually when you run Hydra or on startup using **launchctl**

## Configuration
### MacOSX / Linux
Create a file named `~/.lein/profiles.clj` with **at minimum** the following:
```clojure
{:dev {:env {; PostgreSQL database configuration
             :db-host      "XXX"
             :db-port      5432
             :db-user      "XXX"   ; database username
             :db-password  "XXX"   ; database password
             :db-name      "hydra" ; database name, unless you want it to be something else

             ; A dummy Authentication mode which will accept any matching "email-address" and password, e.g. "admin"/"admin"
             ;:authenticator     "match"

             ; Firebase Authentication
             :authenticator                 "firebase"
             :authenticator-firebase-key    "your firebase key here"
             :authenticator-firebase-domain "your firebase domain here"

             ; Mozilla Persona Authentication (RIP - https://techcrunch.com/2014/03/08/mozilla-stops-developing-its-persona-sign-in-system-because-of-low-adoption/)
             ;:authenticator      "persona"
             ;:authenticator-host "http://localhost:3000"

             ; LDAP Authentication (for Windows Domains / Active Directory)
             ;:authenticator     "ldap"
             ;:ldap-domain       "XXX"
             ;:ldap-host         "host:port" ; e.g. 192.168.1.10:3389
             ;:ldap-bind-dn      "XXX" ; probably of the format "domain\\username"
             ;:ldap-password     "XXX"

             ; rabbitmq configuration (OPTIONAL)
             :rabbitmq-host      "localhost"
             :rabbitmq-username  "XXX" ; probably "guest"
             :rabbitmq-password  "XXX" ; also probably "guest"
             }}}
```

## Building
1. Install the `rest-client` dependencies (but you don't have to build)

  ```shell
  cd rest-client; npm install;
  cd ..
  ```

2. Build the `web-service-front-end`

  ```shell
  cd web-service-front-end; npm install && bower install && grunt dev;
  cd ..
  ```
  
  *Note:* You can also use `grunt staging` or `grunt build` for staging or production server URLs configured inside the `rest-client`.
3. Build the `web-service` back-end

  ```shell
  cd web-service; lein repl
  ```
  
  ... wait for it to start
  
  `web-service.core=>` `(use 'web-service.core)`
  
  `web-service.core=>` `(-main)`
  
At this point the back-end will be running with whatever was built in `web-service-front-end` as the UI. You can point your browser to `localhost:3000` to develop on the back-eend.
  
  The `web-service-front-end` also has a `grunt serve` function for live development with hot code reloading. If all you want to do is develop on the front-end you use `grunt serve` and hit `localhost:9000` instead.

Team
==
Made with love by the following people
- [Kevin Mershon](https://github.com/kevinmershon)
- [Devin Leonhart](https://github.com/devinleonhart)
- [Brent Houghton](https://github.com/starim)
- [Cristopher Pascua](https://github.com/cpascua)
- [Aaron Pflaumer](https://github.com/aaronpflaumer)
- [Bethany Armitage](https://github.com/bethgrace5)

forked from [Slixbits](https://github.com/Slixbits/hydra-core)

License
==
[GNU General Public License v3](https://www.gnu.org/licenses/gpl-3.0.en.html)
