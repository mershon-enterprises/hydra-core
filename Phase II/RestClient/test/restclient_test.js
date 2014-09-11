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
var createdUUID = null;
var goodLogin = function(callback) {
  restclient.authenticate(
    "admin@example.com",
    "adminpassword",
    function(statusCode, body) {
      // update the api token
      var bodyObj = JSON.parse(body);
      apiToken = bodyObj['token'];

      callback(statusCode, body);
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
    restclient.version(
      function(statusCode, body) {
        test.equal(statusCode, 200, 'get version should succeed');
        var bodyObj = JSON.parse(body);
        test.ok('version' in bodyObj,
          'version should be stated');
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
      function(statusCode, body) {
        test.equal(statusCode, 401, 'login should fail');
        test.equal(body, 'Invalid credentials', 'login body text');
        test.done();
      });
  },
  'admin': function(test) {
    test.expect(8);
    goodLogin(
      function(statusCode, body) {
        test.equal(statusCode, 200, 'login should succeed');

        var bodyObj = JSON.parse(body);
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
      function(statusCode, body) {
        test.equal(statusCode, 401, 'access level list should fail');
        test.equal(body, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(7);
    restclient.listAccessLevels(
      apiToken,
      function(statusCode, body) {
        test.equal(statusCode, 200, 'access level list should succeed');

        var bodyObj = JSON.parse(body);
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
      function(statusCode, body) {
        test.equal(statusCode, 401, 'access level get should fail');
        test.equal(body, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  // TODO -- implement test for specifying nonexistent access level
  'manage-clients': function(test) {
    test.expect(8);
    restclient.getAccessLevel(
      apiToken,
      'Manage Clients',
      function(statusCode, body) {
        test.equal(statusCode, 200, 'access level get should succeed');

        var bodyObj = JSON.parse(body);
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
      function(statusCode, body) {
        test.equal(statusCode, 401, 'client list get should fail');
        test.equal(body, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(7);
    restclient.listClients(
      apiToken,
      function(statusCode, body) {
        test.equal(statusCode, 200, 'client list should succeed');

        var bodyObj = JSON.parse(body);
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
      function(statusCode, body) {
        test.equal(statusCode, 401, 'get client get should fail');
        test.equal(body, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  // TODO -- implement test for specifying nonexistent client
  'with-api-token': function(test) {
    test.expect(8);
    restclient.getClient(
      apiToken,
      'Chevron',
      function(statusCode, body) {
        test.equal(statusCode, 200, 'get client should succeed');

        var bodyObj = JSON.parse(body);
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
      function(statusCode, body) {
        test.equal(statusCode, 401, 'list client locations get should fail');
        test.equal(body, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(7);
    restclient.listClientLocations(
      apiToken,
      'Chevron',
      function(statusCode, body) {
        test.equal(statusCode, 200, 'client list should succeed');

        var bodyObj = JSON.parse(body);
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
      function(statusCode, body) {
        test.equal(statusCode, 401, 'list data get should fail');
        test.equal(body, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(12);
    restclient.listData(
      apiToken,
      function(statusCode, body) {
        test.equal(statusCode, 200, 'list data should succeed');

        var bodyObj = JSON.parse(body);
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
      function(statusCode, body) {
        test.equal(statusCode, 401, 'get data get should fail');
        test.equal(body, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  // TODO -- implement test for specifying nonexistent data
  'with-api-token': function(test) {
    test.expect(11);
    restclient.getData(
      apiToken,
      '7fa1f8f6-498d-4054-9300-4fcd4fa6bb57',
      function(statusCode, body) {
        test.equal(statusCode, 200, 'get data should succeed');

        var bodyObj = JSON.parse(body);
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
          '7fa1f8f6-498d-4054-9300-4fcd4fa6bb57',
          'testing sentinel data-set uuid should match');
        test.done();
      });
  }
};

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
      new Date(),
      null,
      [restclient.PrimitiveData('boolean', 'placeholder', false)],
      function(statusCode, body) {
        test.equal(statusCode, 401, 'submit data get should fail');
        test.equal(body, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'null-date': function(test) {
    test.expect(1);
    test.throws(function() {
      restclient.submitData(
        apiToken,
        null,
        'anyone@anywhere',
        [],
        function(statusCode, body) {
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
        apiToken,
        new Date(),
        'anyone@anywhere',
        [],
        function(statusCode, body) {
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
        apiToken,
        new Date(),
        'anyone@anywhere',
        [{value: 'ploop'}],
        function(statusCode, body) {
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
      apiToken,
      new Date(),
      'admin@example.com',
      [{type: 'boolean', description: 'test data', value: true}],
      function(statusCode, body) {
        test.equal(statusCode, 201, 'submit data should succeed');

        var bodyObj = JSON.parse(body);
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
      function(statusCode, body) {
        test.equal(statusCode, 401, 'delete data should fail');
        test.equal(body, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(5);
    restclient.deleteData(
      apiToken,
      createdUUID,
      function(statusCode, body) {
        test.equal(statusCode, 200, 'delete data should succeed');

        var bodyObj = JSON.parse(body);
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
      function(statusCode, body) {
        test.equal(statusCode, 401, 'list users should fail');
        test.equal(body, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(7);
    restclient.listUsers(
      apiToken,
      function(statusCode, body) {
        test.equal(statusCode, 200, 'list users should succeed');

        var bodyObj = JSON.parse(body);
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
      function(statusCode, body) {
        test.equal(statusCode, 401, 'get user should fail');
        test.equal(body, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(8);
    restclient.getUser(
      apiToken,
      'admin@example.com',
      function(statusCode, body) {
        test.equal(statusCode, 200, 'get user should succeed');

        var bodyObj = JSON.parse(body);
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
      function(statusCode, body) {
        test.equal(statusCode, 401, 'list user access should fail');
        test.equal(body, 'Access Denied: Invalid API Token', 'invalid api token text');
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(7);
    restclient.listUserAccess(
      apiToken,
      'admin@example.com',
      function(statusCode, body) {
        test.equal(statusCode, 200, 'list user access should succeed');

        var bodyObj = JSON.parse(body);
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
