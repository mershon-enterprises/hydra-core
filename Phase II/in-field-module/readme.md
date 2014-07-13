Data Gatherer (working name)
==

This is a browser extension designed to gather information from a well test and transmit it to a waiting server. It collects data from a Red Lion data logger as well as some manually-entered data points.

In order to quickly get this extension working, it currently only works in the
Google Chrome browser, due to extensive support for Chrome-specfic extensions
in existing Grunt modules. Support for other browsers should be added later.

Development
--
Run ```grunt build``` to produce an unpacked copy of the extension in the
```dist``` folder. Generating a packed extension that can be installed directly
into the browser requires registering with the Chrome app store, so at this
point in development we simply generate an unpacked version of the extension.
To install it, navigate to the extensions page in Chrome (Main Menu > Tools >
Extensions). Now check the small box at the top-right for developer mode. A
"Load Unpacked Extension..." button will be become visible. Click it and in the
dialog box that appears, navigate to the dist folder and click Open. The
browser should then load the extension.

