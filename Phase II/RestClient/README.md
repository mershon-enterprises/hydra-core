# RestClient

CommonJS REST API client

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

These are the method signatures of the `restclient`:
```javascript
restclient.version(callback);
restclient.authenticate(emailAddress, password, callback);
restclient.listAcccessLevels(apiToken, callback);
restclient.getAccessLevel(apiToken, accessLevelDescription, callback);
restclient.listClients(apiToken, callback);
restclient.getClient(apiToken, clientName, callback);
restclient.listClientLocations(apiToken, callback);
restclient.listData(apiToken, callback);
restclient.getData(apiToken, datasetUUID, callback);
restclient.submitData(apiToken, dateCreated, createdByEmailAddress, dataItems, callback);
restclient.deleteData(apiToken, datasetUUID, callback);
restclient.listUsers(apiToken, callback);
restclient.getUser(apiToken, emailAddress, callback);
restclient.listUserAccess(apiToken, callback);
```

For the method `restclient.submitData`, each element in the `dataItems` array must be an instance of either `restclient.Attachment` or `restclient.PrimitiveData`. UUIDs which are UUID type-4 compliant can be generated using the helper method `restclient.uuid()`.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## License
 
 Copyright (c) 2014 Slixbits Inc. Licensed under the GPLv3 license.
