Data Gatherer (working name)
==

Overview
--
This is a browser extension designed to gather information from a well test and
transmit it to a waiting server. It collects data from a Red Lion data logger
as well as some manually-entered data points.

In order to quickly get this extension working, it currently only works in the
Google Chrome browser, due to extensive support for Chrome-specfic extensions
in existing Grunt modules. Support for other browsers should be added later.

Frameworks
--
* [Bower](http://bower.io/)
* [Grunt](http://gruntjs.com/)
* [Ember](http://emberjs.com/)

Getting Started
--

1. [install the NodeJS Package Manager (npm)](http://howtonode.org/introduction-to-npm)
1. [install Bower](http://bower.io/)
1. [install Grunt ("Installing the CLI" section)](http://gruntjs.com/getting-started#installing-the-cli)
1. [install wkhtmltopdf](http://wkhtmltopdf.org/) and make sure it is available on the PATH

These tools will be able to install the other dependencies themselves. Just
make sure your terminal's working directory is the folder that contains the
Gruntfile and run the following commands:
1. ```npm install```
1. ```bower install```
1. ```grunt bowerInstall```

Developing
--
Run ```grunt dev``` to produce an unpacked copy of the extension in the
```dist``` folder. The dev task differs from the build task by skipping
minifying asset files in order to speed up compilation.

Since this is a browser extension, there's no obvious equivalent of livereload
for instantly seeing updates as soon as a file is changed. I'm investigating
ways to implement this useful development feature but for now you will have to
run ```grunt dev``` and then reload the extension in Chrome to see changes to
source files take effect.

Building
--
Run ```grunt build``` to produce an unpacked copy of the extension in the
```dist``` folder. The build task differs from the dev task by fully minifying
all asset files to produce the leanest package possible.

Installing
--
To install the Chrome extension compiled by either ```grunt dev``` or ```grunt
build```, navigate to the extensions page in Chrome (Main Menu > Tools >
Extensions). Now check the small box at the top-right for developer mode. A
"Load Unpacked Extension..." button will be become visible.  Click it and in
the dialog box that appears, navigate to the dist folder and click Open. The
browser should then load the extension.

