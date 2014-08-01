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
