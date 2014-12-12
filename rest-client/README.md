# Rest Client

CommonJS REST API client

[Getting Started](#getting-started)
* [On the server](#on-the-server)
* [In the browser](#in-the-browser)

[Documentation](#documentation)
* [Callback Function](#callback-function)
* [API Tokens](#api-tokens)
* [Method Signatures](#method-signatures)

[Contributing](#contributing)

[License](#license)

## Getting Started
### On the server
Install the module with: `npm install restclient`

```javascript
var restclient = require('restclient');
restclient.uuid(); // "gets a uuid"
```

### In the browser
Build the product with `grunt dist`.

[min]: `restclient.standalone.min.js`
[max]: `restclient.standalone.js`

In your web page:

```html
<script src="dist/restclient.standalone.min.js"></script>
<script>
restclient.authenticate("email address", "password", function(statusCode, entity) {
  if (statusCode == 200) {
    // success!
  } else if (statusCode == 401) {
    // failure!
  }
});
</script>
```


## Documentation
###Callback Function
Every method exposed via `restclient` takes as its last parameter a callback function, ala:
```javascript
function(statusCode, entity) {
  // statusCode meanings are HTTP standard status response codes
  //
  // statusCode in the 200-299 range is "good",
  // statusCode in the 400-599 range is "bad"

  // entity may be a String, or a JSON object or array
  var bodyObject = JSON.parse(entity);
  // keys in the response from the server can be directly referenced as properties of bodyObject
}
```

###API Tokens
Additionally, except for `authenticate` and `version`, every method exposed via `restclient` takes as its first parameter an ever-changing API Token. Invoke `authenticate` to generate an API Token, and every request after that will take the API token, expire it, and then return a new one. Follow the process like this:
```javascript
var apiToken = null;
restclient.authenticate(email, password, function(statusCode, entity)) {
  if (statusCode == 200) {
    var bodyObject = JSON.parse(entity);
    apiToken = bodyObject['token']; // token is now non-null

    // list users
    restclient.listUsers(apiToken, function(statusCode2, entity2) {
      if (statusCode == 200) ){
        var bodyObject2 = JSON.parse(entity2);
        apiToken = bodyObject2['token']; // token is now different from last request
      }
    }
  }
}
```

###Method Signatures
These are the method signatures of the `rest-client`:

```javascript
restclient.version(callback);
```

```javascript
restclient.authenticate(clientUUID, emailAddress, password)
```

Authenticates the user's credentials against the LDAP server.

`clientUUID` - Unique identifier for a client machine. Generated from
restclient.uuid.
`emailAddress` - Username for the user as a string.
`password` - Password for the user as an unencrypted string.

Returns

```javascript
restclient.listAcccessLevels(apiToken, callback);
```

```javascript
restclient.getAccessLevel(apiToken, accessLevelDescription, callback);
```

```javascript
restclient.listClients(apiToken, callback);
```

```javascript
restclient.getClient(apiToken, clientName, callback);
```

```javascript
restclient.listClientLocations(apiToken, callback);
```

```javascript
restclient.listData(apiToken, callback);
```

```javascript
restclient.getData(apiToken, datasetUUID, callback);
```

```javascript
restclient.submitData(apiToken, dateCreated, createdByEmailAddress, dataItems, callback);
```

```javascript
restclient.deleteData(apiToken, datasetUUID, callback);
```

```javascript
restclient.listUsers(apiToken, callback);
```

```javascript
restclient.getUser(apiToken, emailAddress, callback);
```

```javascript
restclient.listUserAccess(apiToken, callback);
```

For the method `restclient.submitData`, each element in the `dataItems` array must be an instance of either `restclient.Attachment` or `restclient.PrimitiveData`. UUIDs which are UUID type-4 compliant can be generated using the helper method `restclient.uuid()`.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## License
 Copyright (c) 2014 Slixbits Inc. Licensed under the GPLv3 license.
