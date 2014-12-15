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

###clientUUID


###API Tokens
Many restclient methods take as its first parameter an ever-changing API Token. Invoke `authenticate` to generate an API Token. Every restclient method that takes an API token will expire it and then return a new one. Follow the process like this:
```javascript
//Set up variables to call authenticate and store apiToken
var clientUUID = restclient.uuid;
var apiToken = null;
var credentials = {};

credentials.email = 'test@test.com';
credentials.password = 'abc123';

//Invoke restclient.authenticate. A promise will be returned.
restclient.authenticate(clientUUID, credentials.email, credentials.password).then(
  function (response) {
    //If the server responded with an OK status...
    if (response.status.code === 200) {

      var jsonResponse = JSON.parse(response.entity);

      //Extract the apiToken
      apiToken = jsonResponse.token;

      console.log('Authenticate Successful');
      console.log(apiToken);
    }
    else {
      console.log('Bad status code.');
    }

  },
  function (reject) {
    console.log('Promise failed.');
    console.log(reject);
  });

```
Many restclient methods return a promise. You will need to extract the apiToken from the promise success callback function.
The token is not available if the promise returns as a rejection. The token will also not change if you call a restclient
method with an apiToken as a parameter and the promise fails.

```javascript
promise.then(function(response) {
    //Api token will update.
  }, function(error) {
    //Api token will not update.
  }
);

```

###Method Signatures
These are the method signatures of the `rest-client`:


```javascript
restclient.endpointUrl();
```

A placeholder string to be replaced by grunt.

```javascript
restclient.uuid();
```

Generates a type 4 UUID to be used as a client identifier for other restclient calls.

```javascript
restclient.Attachment(filename, mimeType, contents);
```

Generates an Attachment object of the following format:
{
  type: 'attachment',
  filename: filename,
  mime_type: mimeType,
  contents: contents
}

`type` String - "attachment"

`filename` String - Ex: "filename.txt"

`mime_type` String - Ex: "text/csv"

`contents` String - A base64-encoded string.

Specifically used for the `dataItems` argument of `restclient.submitData` when
submitting attachment files to the back-end.

```javascript
restclient.PrimitiveData(type, description, value);
```
Generates an PrimitiveData object of the following format:
{
  type: type,
  description: description,
  value: value
}

`type` String - Ex: "string"

`description` String - Ex: "wellName"

`value` String - "A-001-Alpha"

Specifically used for the `dataItems` argument of `restclient.submitData` when
submitting tags related to attachment files to the back-end.

{
  type: type,
  description: description,
  value: value
}

```javascript
restclient.version();
```

```javascript
restclient.authenticate(clientUUID, emailAddress, password);
```

Authenticates the user's credentials against the LDAP server.

`clientUUID` - Unique identifier for a client machine. Generated from
restclient.uuid.

`emailAddress` - Username for the user as a string.

`password` - Password for the user as an unencrypted string.


```javascript
restclient.adminAuthenticate(clientUUID, emailAddress, password, userEmailAddress);
```

```javascript
restclient.listAccessLevels(clientUUID, apiToken);
```

```javascript
restclient.getAccessLevel(clientUUID, apiToken, description);
```

```javascript
restclient.listClients(clientUUID, apiToken);
```

```javascript
restclient.getClient(clientUUID, apiToken, name);
```

```javascript
restclient.listClientLocations(clientUUID, apiToken, name);
```

```javascript
restclient.listData(clientUUID, apiToken, searchParams);
```

```javascript
restclient.getData(clientUUID, apiToken, uuid);
```

```javascript
restclient.submitData(clientUUID, apiToken, dateCreated, createdBy, dataItems);
```

```javascript
restclient.deleteData(clientUUID, apiToken, uuid);
```

```javascript
restclient.listAttachments(clientUUID, apiToken, searchParams);
```

```javascript
restclient.getAttachment(clientUUID, apiToken, uuid, filename);
```

```javascript
restclient.getAttachmentURL(clientUUID, apiToken, uuid, filename);
```

```javascript
restclient.getAttachmentInfo(clientUUID, apiToken, uuid, filename);
```

```javascript
restclient.renameAttachment(clientUUID, apiToken, uuid, filename, newFilename);
```

```javascript
restclient.deleteAttachment(clientUUID, apiToken, uuid, filename);
```

```javascript
restclient.submitTag(clientUUID, apiToken, uuid, type, description, value);
```

```javascript
restclient.deleteTag(clientUUID, apiToken, uuid, type, description);
```

```javascript
restclient.listUsers(clientUUID, apiToken);
```

```javascript
restclient.getUser(clientUUID, apiToken, emailAddress);
```

```javascript
restclient.listUserAccess(clientUUID, apiToken, emailAddress);
```



For the method `restclient.submitData`, each element in the `dataItems` array must be an instance of either `restclient.Attachment` or `restclient.PrimitiveData`. UUIDs which are UUID type-4 compliant can be generated using the helper method `restclient.uuid()`.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## License
 Copyright (c) 2014 Slixbits Inc. Licensed under the GPLv3 license.
