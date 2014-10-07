hydra-core
=======================

AngularJS frontend for the clojure web-service.

The `yo angular` generator was used to scaffold the project.

Requirements
------------

You will need `npm`/`nodejs` installed, along with the `grunt-cli` to aquire
dependencies.

One of the dependencies is [CSS Compass](http://compass-style.org/ "CSS Compass").
This requires `ruby`.

```bash
sudo gem update --system
gem install compass
```

Be sure to append `~/.gem/ruby/2.1.0/bin` to your path.

Grunt Tasks
-----------

`grunt build` -> Create distribution version. `/dist/`
`grunt test` -> Tests with Karma and Phantomjs. `/test/`
`grunt serve` -> Load local webserver for development. `/.tmp/`
