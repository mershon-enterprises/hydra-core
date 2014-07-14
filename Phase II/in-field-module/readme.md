Data Gatherer (working name)
==

This is a browser extension designed to gather information from a well test and transmit it to a waiting server. It collects data from a Red Lion data logger as well as some manually-entered data points.

In order to quickly get this extension working, it currently only works in the
Google Chrome browser, due to extensive support for Chrome-specfic extensions
in existing Grunt modules. Support for other browsers should be added later.

Development
--
Run ```grunt dev``` to produce an unpacked copy of the extension in the
```dist``` folder. To install it, navigate to the extensions page in Chrome
(Main Menu > Tools > Extensions). Now check the small box at the top-right for
developer mode. A "Load Unpacked Extension..." button will be become visible.
Click it and in the dialog box that appears, navigate to the dist folder and
click Open. The browser should then load the extension.

Production
--
Still being worked on. Right now there is a ```build``` task, but it doesn't
fully work. Be aware that it will also rewrite the script and stylesheet links
in the HTML source files in the app folder when run.

