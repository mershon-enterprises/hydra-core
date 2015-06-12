hydra-core
=======================

Overview
==
The database design will be used in all three phases of the project, and as such
does not belong in any subfolder specific to a certain phase of the project. The
database model has been  initially developed using the 
[Liquibase](http://www.liquibase.org/)
[XML format](http://www.liquibase.org/documentation/xml_format.html) for maximum
compatibility with any platform which may be selected for development of the
remainder of the project. Once a web framework has been selected, the DDL may me 
ported to the native migration format of that framework.

Design
==
The database is designed in three key component areas: clients, data, and users.
The structures for data are connected to the client and user structures, such that
no table is an island of functionality; it is all a cohesive unified design.

User Tables
---
- The user tables are defined with the intent of using a third-party authentication
platform such as OpenID or Mozilla Persona, to simplify credentials management.
- Every user session can be stored in the database, and any number of parameters of 
interest in the session can be stored related to the session.

Client Tables
---
- The client tables simply describe a client name and location of arbitrary definition.

Data Tables
---
- The data tables are designed to house any of the 5 primitive forms of data (booleans,
dates, integers, double precision reals, and text), given meaning through their
descriptions.
- Each set of day may optionally be bound to a user and/or location through their common
parent table.
- Any number of binary files can be attached to a set of data, which
permits the descriptions of the data to be linked to the files for implementing
search functionality.

Getting Started
--
To get started, you need to
[download and install Apache Maven](http://maven.apache.org/download.cgi) and ensure
it is on your system path.  Mac OSX users running [Homebrew](http://brew.sh/) can simply
run the command `brew install maven`. The configuration currently expects a PostgreSQL
database running on `localhost` port `5432` with credentials `postgres`/`password`. To
instantiate an instance of the database using Maven, simply run `mvn process-resources`
in the `Database` folder.

Developing
--
In the case further development is needed while still using the Liquibase utility,
it is important to understand how the changelogs are defined. The project currently has
a master `changelog.xml` file which contains references to child changelogs to be 
applied to the database. Each child changelog is incrementally number so that the
filesystem sort order matches the chronological order of implementation.

Each changeset should be defined per the Liquibase [changeset tag
documentation](http://www.liquibase.org/documentation/changeset.html), and
involve all necessary
[refactoring](http://www.liquibase.org/documentation/changes/index.html) actions
(see the **Bundled Changes** menu on the left-hand side) to make the desired
change. Every `<changeSet>` element must have a unique alphanumeric id and full name
of the author who originated it. Use of `<comment>` tags is preferred to
XML-formatted comments.

Once the child changelog has been finished, ensure the master
`changelog.xml` file has been updated to have a reference to the child
changelog, and then the `liquibase` command line can be executed to update the
associated database.
