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
    restclient.authenticate(
        "admin@example.com",
        "adminpassword",
        function(statusCode, body) {
          test.equal(statusCode, 200, 'login should succeed');

          var bodyObj = JSON.parse(body);
          test.ok('token' in bodyObj,
            'token should be supplied');
          test.notEqual('token_expiration_date' in bodyObj,
            'token expiration should be supplied');
          test.notEqual('response' in bodyObj,
            'login response should be stated');

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
