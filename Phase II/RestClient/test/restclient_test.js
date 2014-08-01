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
          test.notEqual(bodyObj['version'], undefined, 'version should be stated');
          test.done();
        });
  }
};

exports['login'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'no-args': function(test) {
    test.expect(2);
    restclient.login(
        null,
        null,
        function(statusCode, body) {
          test.equal(statusCode, 401, 'login should fail');
          test.equal(body, 'Invalid email or password', 'login body text');
          test.done();
        });
  },
  'admin': function(test) {
    test.expect(2);
    // tests here
    restclient.login(
        "admin@example.com",
        "adminpassword",
        function(statusCode, body) {
          test.equal(statusCode, 200, 'login should succeed');
          test.equal(body, 'Now logged in as PI VPN ', 'login body text');
          test.done();
        });
  }
};

exports['logout'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'no-args': function(test) {
    test.expect(2);
    restclient.logout(
        function(statusCode, body) {
          test.equal(statusCode, 200, 'logout should succeed');
          test.equal(body, 'Now logged out', 'logout body text');
          test.done();
        });
  }
};
