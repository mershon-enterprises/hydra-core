'use strict';

var restclient = require('../src/restclient.js');

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
          'Manage Clients access level should exist');
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
          'description should be manage Clients');
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
          'Chevron client should exist');
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
          'name should be Chevron');
        test.done();
      });
  }
};
