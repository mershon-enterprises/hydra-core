hydra-core
=======================

Overview
==
The database design will be used in all three phases of the project, and as such
does not belong in the **Phase I** subfolder. The database model is developed
using [Liquibase](http://www.liquibase.org/) [XML
format](http://www.liquibase.org/documentation/xml_format.html) for maximum
compatibility with any platform which may be selected for development of the
remainder of the project.

Getting Started
--
To get started, you need to
[download](http://www.liquibase.org/download/index.html) Liquibase and put it on
your system path.  Mac OSX users running [Homebrew](http://brew.sh/) can simply
run the command `brew install liquibase`. The [Liquibase
command-line](http://www.liquibase.org/documentation/command_line.html) permits
a user to create, update, rollback, and drop a database schema. All connection
parameters are specified as command flags unless Liquibase is incorporated into
a build manager for a project, in which case the project configuration is
responsible for specifying connection parameters. See the **Required
Parameters** and **Optional Parameters** section of the command line
documentation for examples.

Developing
--
For simplicity and maximum compatibility with future framework selection, we
will work with a master `changelog.xml` file which will contain references to
child changelogs to be applied to the database. Each child changelog will be
numbered for the filesystem sort order to match the chronological order of
implementation.

Each changeset should be defined per the Liquibase [changeset tag
documentation](http://www.liquibase.org/documentation/changeset.html), and
involve all necessary
[refactoring](http://www.liquibase.org/documentation/changes/index.html) actions
(see the **Bundled Changes** menu on the left-hand side) to make the desired
change. Once the child changelog has been finished, ensure the master
`changelog.xml` file has been updated to have a reference to the child
changelog, and then the `liquibase` command line can be executed to update the
associated database.
