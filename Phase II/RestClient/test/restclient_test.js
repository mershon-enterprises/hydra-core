'use strict';

var restclient = require('../src/restclient.js');
restclient.endpointUrl = 'http://localhost:3000';

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var apiToken = null;
var clientUUID = "00000000-0000-0000-0000-000000000000";
var createdUUID = null;
var goodLogin = function(callback) {
  restclient.authenticate(
    clientUUID,
    "admin@example.com",
    "adminpassword"
  ).then(
    function(data) {
      // update the api token
      try {
        var bodyObj = JSON.parse(data.entity);
        apiToken = bodyObj['token'];

        callback(data);
      } catch (e) {
        console.log(e.message);
        console.log("Body was: " + data.entity);
      }
    });
};
var checkResponse = function(test, bodyObj) {
  test.ok('token' in bodyObj,
    'token should be supplied');
  test.notEqual('token_expiration_date' in bodyObj,
    'token expiration should be supplied');
  test.notEqual('response' in bodyObj,
    'login response should be stated');

  // update the api token
  apiToken = bodyObj['token'];
};

exports['version'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'no-args': function(test) {
    test.expect(2);
    restclient.version().then(
      function(data) {
        test.equal(data.status.code, 200, 'get version should succeed');
        try {
          var bodyObj = JSON.parse(data.entity);
          test.ok('version' in bodyObj,
            'version should be stated');
        } catch (e) {
          console.log(e.message);
          console.log("Body was: " + data.entity);
        }
        test.done();
      });
  }
};

exports['authenticate'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'no-args': function(test) {
    test.expect(2);
    restclient.authenticate(
      null,
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'login should fail');
        test.equal(data.entity, 'Invalid credentials', 'login body text');
        test.done();
      });
  },
  'admin': function(test) {
    test.expect(8);
    goodLogin(
      function(data) {
        test.equal(data.status.code, 200, 'login should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.notEqual('email_address' in bodyObj['response'],
          'login response email address should be stated');
        test.notEqual('first_name' in bodyObj['response'],
          'login response first name should be stated');
        test.ok('last_name' in bodyObj['response'],
          'login response last name should be stated');
        test.ok('access' in bodyObj['response'],
          'login response user access should be stated');
        test.done();
      });
  }
};

exports['adminAuthenticate'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'no-args': function(test) {
    test.expect(2);
    restclient.adminAuthenticate(
      null,
      null,
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'login should fail');
        test.equal(data.entity, 'Invalid credentials', 'login body text');
        test.done();
      });
  },
  'admin': function(test) {
    test.expect(8);
    restclient.adminAuthenticate(
      clientUUID,
      'admin@example.com',
      'adminpassword',
      'basicuser@example.com'
    ).then(
      function(data) {
        test.equal(data.status.code, 200, 'login should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.notEqual('email_address' in bodyObj['response'],
          'login response email address should be stated');
        test.notEqual('first_name' in bodyObj['response'],
          'login response first name should be stated');
        test.ok('last_name' in bodyObj['response'],
          'login response last name should be stated');
        test.ok('access' in bodyObj['response'],
          'login response user access should be stated');

        // log back in as the admin account so the next test passes
        goodLogin(function() {
          test.done();
        });
      });
  }
};

exports['listAccessLevels'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.listAccessLevels(
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'access level list should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(7);
    restclient.listAccessLevels(
      clientUUID,
      apiToken
    ).then(
      function(data) {
        test.equal(data.status.code, 200, 'access level list should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.ok(Array.isArray(bodyObj['response']),
          'access level list should be an array');
        test.ok(bodyObj['response'].length > 0,
          'at least one access level should exist');

        test.notEqual(bodyObj['response'].indexOf('Manage Clients'), -1,
          'testing sentinel access level should exist');
        test.done();
      });
  }
};

exports['getAccessLevel'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.getAccessLevel(
      null,
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'access level get should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  // TODO -- implement test for specifying nonexistent access level
  'manage-clients': function(test) {
    test.expect(8);
    restclient.getAccessLevel(
      clientUUID,
      apiToken,
      'Manage Clients'
    ).then(
      function(data) {
        test.equal(data.status.code, 200, 'access level get should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.ok('description' in bodyObj['response'],
          'description should be stated');
        test.ok('date_modified' in bodyObj['response'],
          'date modified should be stated');
        test.ok('date_created' in bodyObj['response'],
          'date created should be stated');

        test.equal(bodyObj['response']['description'], 'Manage Clients',
          'testing sentinel access level should match');
        test.done();
      });
  }
};

exports['listClients'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.listClients(
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'client list get should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(7);
    restclient.listClients(
      clientUUID,
      apiToken
    ).then(
      function(data) {
        test.equal(data.status.code, 200, 'client list should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.ok(Array.isArray(bodyObj['response']),
          'client list should be an array');
        test.ok(bodyObj['response'].length > 0,
          'at least one client should exist');

        test.notEqual(bodyObj['response'].indexOf('Chevron'), -1,
          'testing sentinel client should exist');
        test.done();
      });
  }
};

exports['getClient'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.getClient(
      null,
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'get client get should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  // TODO -- implement test for specifying nonexistent client
  'with-api-token': function(test) {
    test.expect(8);
    restclient.getClient(
      clientUUID,
      apiToken,
      'Chevron'
    ).then(
      function(data) {
        test.equal(data.status.code, 200, 'get client should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.ok('name' in bodyObj['response'],
          'name should be stated');
        test.ok('date_modified' in bodyObj['response'],
          'date modified should be stated');
        test.ok('date_created' in bodyObj['response'],
          'date created should be stated');

        test.equal(bodyObj['response']['name'], 'Chevron',
          'testing sentinel client name should match');
        test.done();
      });
  }
};

exports['listClientLocations'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.listClientLocations(
      null,
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'list client locations get should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(7);
    restclient.listClientLocations(
      clientUUID,
      apiToken,
      'Chevron'
    ).then(
      function(data) {
        test.equal(data.status.code, 200, 'client list should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.ok(Array.isArray(bodyObj['response']),
          'locations list should be an array');
        test.ok(bodyObj['response'].length > 0,
          'at least one location should exist');

        test.notEqual(bodyObj['response'].indexOf('Kern River'), -1,
          'testing client sentinel location should exist');
        test.done();
      });
  }
};

exports['listData'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.listData(
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'list data get should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(12);
    restclient.listData(
      clientUUID,
      apiToken
    ).then(
      function(data) {
        test.equal(data.status.code, 200, 'list data should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.ok(Array.isArray(bodyObj['response']),
          'data list should be an array');
        test.ok(bodyObj['response'].length > 0,
          'at least one data-set should exist');
        test.ok('uuid' in bodyObj['response'][0],
          'data-set uuid should be stated');
        test.ok('date_created' in bodyObj['response'][0],
          'data-set date created should be stated');
        test.ok('created_by' in bodyObj['response'][0],
          'data-set created-by should be stated');
        test.ok('data' in bodyObj['response'][0],
          'data-set data should be stated');
        test.ok(Array.isArray(bodyObj['response'][0]['data']),
          'data-set data should be an array');
        test.ok(bodyObj['response'][0]['data'].length > 0,
          'at least one data-set data item should exist');

        test.done();
      });
  }
};

// GOTCHA -- test submitData before getData so we know we have a dataset to
// validate against
exports['submitData'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.submitData(
      null,
      null,
      new Date(),
      null,
      [restclient.PrimitiveData('boolean', 'placeholder', false)]
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'submit data get should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'null-date': function(test) {
    test.expect(1);
    test.throws(function() {
      restclient.submitData(
        clientUUID,
        apiToken,
        null,
        'anyone@anywhere',
        []
      ).then(
        function(data) {
          // doesn't matter, callback shouldn't run
        });
      },
      'Date created must be specified',
      'error thrown when dateCreated null');
    test.done();
  },
  'no-data': function(test) {
    test.expect(1);
    test.throws(function() {
      restclient.submitData(
        clientUUID,
        apiToken,
        new Date(),
        'anyone@anywhere',
        []
      ).then(
        function(data) {
          // doesn't matter, callback shouldn't run
        });
      },
      'Data items must be an array of Attachment and PrimitiveData ' +
        'and contain at least one item',
      'error thrown when dataItems empty');
    test.done();
  },
  'bad-data': function(test) {
    test.expect(1);
    test.throws(function() {
      restclient.submitData(
        clientUUID,
        apiToken,
        new Date(),
        'anyone@anywhere',
        [{value: 'ploop'}]
      ).then(
        function(data) {
          // doesn't matter, callback shouldn't run
        });
    },
    'Invalid data item at position 0: ' +
      'must be of type Attachment or PrimitiveData',
    'error thrown when bad dataItems submitted');
    test.done();
  },
  'good-data': function(test) {
    test.expect(14);
    restclient.submitData(
      clientUUID,
      apiToken,
      new Date(),
      'admin@example.com',
      [{type: 'boolean', description: 'test data', value: true}]
    ).then(
      function(data) {
        test.equal(data.status.code, 201, 'submit data should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.ok('uuid' in bodyObj['response'],
          'data-set uuid should be stated');
        test.ok('date_created' in bodyObj['response'],
          'data-set date created should be stated');
        test.ok('created_by' in bodyObj['response'],
          'data-set created-by should be stated');
        test.ok('data' in bodyObj['response'],
          'data-set data should be stated');
        test.ok(Array.isArray(bodyObj['response']['data']),
          'data-set data should be an array');
        test.equal(bodyObj['response']['data'].length, 1,
          'one data item should exist');

        test.equal(bodyObj['response']['created_by'],
          'admin@example.com',
          'email should match submitted value');
        test.equal(bodyObj['response']['data'][0]['type'],
          'boolean',
          'data type should match submitted value');
        test.equal(bodyObj['response']['data'][0]['description'],
          'test data',
          'data description should match submitted value');
        test.equal(bodyObj['response']['data'][0]['value'],
          true,
          'data value should match submitted value');

        createdUUID = bodyObj['response']['uuid'];

        test.done();
      });
  }
};

exports['getData'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.getData(
      null,
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'get data get should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  // TODO -- implement test for specifying nonexistent data
  'with-api-token': function(test) {
    test.expect(11);
    restclient.getData(
      clientUUID,
      apiToken,
      createdUUID
    ).then(
      function(data) {
        test.equal(data.status.code, 200, 'get data should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.ok('uuid' in bodyObj['response'],
          'data-set uuid should be stated');
        test.ok('date_created' in bodyObj['response'],
          'data-set date created should be stated');
        test.ok('created_by' in bodyObj['response'],
          'data-set created-by should be stated');
        test.ok('data' in bodyObj['response'],
          'data-set data should be stated');
        test.ok(Array.isArray(bodyObj['response']['data']),
          'data-set data should be an array');
        test.ok(bodyObj['response']['data'].length > 0,
          'at least one data item should exist');

        test.equal(bodyObj['response']['uuid'],
          createdUUID,
          'testing sentinel data-set uuid should match');
        test.done();
      });
  }
};

exports['deleteData'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.deleteData(
      null,
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'delete data should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(5);
    restclient.deleteData(
      clientUUID,
      apiToken,
      createdUUID
    ).then(
      function(data) {
        test.equal(data.status.code, 200, 'delete data should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.equal(bodyObj['response'], 'OK', 'success response');
        test.done();
      });
  }
};

exports['listUsers'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.listUsers(
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'list users should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(7);
    restclient.listUsers(
      clientUUID,
      apiToken
    ).then(
      function(data) {
        test.equal(data.status.code, 200, 'list users should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.ok(Array.isArray(bodyObj['response']),
          'user list should be an array');
        test.ok(bodyObj['response'].length > 0,
          'at least one user should exist');

        test.notEqual(bodyObj['response'].indexOf('admin@example.com'), -1,
          'VPN account should exist');
        test.done();
      });
  }
};

exports['getUser'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.getUser(
      null,
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'get user should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(8);
    restclient.getUser(
      clientUUID,
      apiToken,
      'admin@example.com'
    ).then(
      function(data) {
        test.equal(data.status.code, 200, 'get user should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.ok('email_address' in bodyObj['response'],
          'email_address should be stated');
        test.ok('date_created' in bodyObj['response'],
          'date created should be stated');
        test.ok('date_modified' in bodyObj['response'],
          'date modified should be stated');

        test.equal(bodyObj['response']['email_address'],
          'admin@example.com',
          'email should match request value');
        test.done();
      });
  }
};

exports['listUserAccess'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.listUserAccess(
      null,
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'list user access should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(7);
    restclient.listUserAccess(
      clientUUID,
      apiToken,
      'admin@example.com'
    ).then(
      function(data) {
        test.equal(data.status.code, 200, 'list user access should succeed');

        var bodyObj = JSON.parse(data.entity);
        checkResponse(test, bodyObj);
        test.ok(Array.isArray(bodyObj['response']),
          'user access list should be an array');
        test.ok(bodyObj['response'].length > 0,
          'at least one user access should exist');

        test.notEqual(bodyObj['response'].indexOf('Manage Users'), -1,
          'Manage Users access level should exist');
        test.done();
      });
  }
};

exports['listAttachments'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.listAttachments(
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'list data get should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(10);
    restclient.listAttachments(
      clientUUID,
      apiToken,
      {limit: 20,
       offset: 10,
       search_string: "2014",
       order_by: "date_created",
       order: "desc" }
    ).then(
      function(data) {
        var bodyObj = JSON.parse(data.entity);

        console.log(data);
        checkResponse(test, bodyObj);
        test.equal(data.status.code, 200, 'list data should succeed');
        test.ok(Array.isArray(bodyObj['response']['attachments']),
          'data list should be an array');
        test.ok(bodyObj['response']['attachments'].length === 20,
          'should return exactly 20 attachments');
        test.ok('data_set_uuid' in bodyObj['response']['attachments'][0],
          'data set uuid should be stated');
        test.ok('date_created' in bodyObj['response']['attachments'][0], 
          'attachment date created should be stated');
        test.ok('created_by' in bodyObj['response']['attachments'][0],
          'attachment created-by should be stated');
        test.ok('filename' in bodyObj['response']['attachments'][0],
          'attachment filename should be stated');

        test.done();
      });
  }
};

exports['getAttachmentInfo'] = {
  setUp: function(done) {
    if (apiToken == null)
      goodLogin();
    done();
  },
  'no-api-token': function(test) {
    test.expect(2);
    restclient.getAttachmentInfo(
      null,
      null,
      null,
      null
    ).then(
      function(data) {
        test.equal(data.status.code, 401, 'list data get should fail');
        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(16);

    var attachmentFilename,
        datasetWithAttachmentUUID,
        attachment = restclient.Attachment("test.csv", "test/csv", ""),
        primitiveData =
          restclient.PrimitiveData('text', 'testTextDescription','testValue');

    restclient.submitData(
      clientUUID,
      apiToken,
      new Date(),
      'admin@example.com',
      [attachment, primitiveData]
    ).then(
      function(submitResponse) {
        var bodyObj = JSON.parse(submitResponse.entity);
        datasetWithAttachmentUUID = bodyObj['response']['uuid'];
        attachmentFilename = bodyObj['response']['data'][0]['filename']
        apiToken = bodyObj['token'];

        restclient.getAttachmentInfo(
            clientUUID,
            apiToken,
            datasetWithAttachmentUUID,
            attachmentFilename
        ).then(
          function(getInfoResponse) {
            var bodyObj = JSON.parse(getInfoResponse.entity);

            checkResponse(test, bodyObj);

            test.equal(getInfoResponse.status.code, 200,
              'list data should succeed');
            test.ok(Array.isArray(bodyObj['response']),
              'data list should be an array');
            test.ok('data_set_uuid' in bodyObj['response'][0],
              'data-set_uuid should be stated');
            test.ok('date_created' in bodyObj['response'][0],
              'attachment date created should be stated');
            test.ok('created_by' in bodyObj['response'][0],
              'attachment created-by should be stated');
            test.ok('data' in bodyObj['response'][0],
              'attachment data should be stated');
            test.ok(Array.isArray(bodyObj['response'][0]['data']),
              'attachment data should be an array');
            test.ok(bodyObj['response'][0]['filename'] === 'test.csv',
              'filename should be called "test.csv"');
            test.ok(bodyObj['response'][0]['created_by'] === 'admin@example.com',
              'created_by should be "admin@example.com"');
            test.ok(bodyObj['response'][0]['data'].length === 1,
              'data should have 1 primitive data elements');
            test.ok(bodyObj['response'][0]['data'][0]['type'] === 'text',
              'primitive data type should be "text"');
            test.ok(bodyObj['response'][0]['data'][0]['description'] === 'testTextDescription',
              'primitive data description should be "testTextDescription"');
            test.ok(bodyObj['response'][0]['data'][0]['value'] === 'testValue',
              'primitive data value should be "testValue"');
            test.done();
        });
    });
  }
};


