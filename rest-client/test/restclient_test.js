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

var async = require('async');
var apiToken = null;
var clientUUID = "00000000-0000-0000-0000-000000000000";
var createdUUID = null;

var limitedLogin= function(callback) {
  return restclient.adminAuthenticate(
    clientUUID,
    'admin@example.com',
    'adminpassword',
    'basicuser@example.com'
  ).then(
    function(data) {
      // update the api token
      try {
        apiToken = data.entity['token'];

        callback(data);
      } catch (e) {
        console.log(e.message);
        console.log("Body was: " + JSON.stringify(data.entity));
      }
    });
};

var goodLogin = function(callback) {
  return restclient.authenticate(
    clientUUID,
    "admin@example.com",
    "adminpassword"
  ).then(
    function(data) {
      // update the api token
      try {
        apiToken = data.entity['token'];

        callback(data);
      } catch (e) {
        console.log(e.message);
        console.log("Body was: " + JSON.stringify(data.entity));
      }
    });
};
var checkResponse = function(test, bodyJSON) {
  test.ok('token' in bodyJSON,
    'token should be supplied');
  test.notEqual('token_expiration_date' in bodyJSON,
    'token expiration should be supplied');
  test.notEqual('response' in bodyJSON,
    'login response should be stated');

  // update the api token
  apiToken = bodyJSON['token'];
};

var submitMockData = function(dataList) {
    return restclient.submitData(
      clientUUID,
      apiToken,
      new Date(),
      'admin@example.com',
      dataList
    );
};

var deleteAllMockData = function(callback) {
  var mockDataSetUUIDList;

  restclient.listAttachments(
    clientUUID,
    apiToken
  ).then(
    function(listAttachmentsResponse){
      // update the api token
      apiToken = listAttachmentsResponse.entity['token'];
      //Get all undeleted dataset uuids
      return async.map(listAttachmentsResponse.entity['response']['attachments'],
        function(x, callback) {
          callback(null, x['data_set_uuid'])
        },
        function(err, results) {
          //remove duplicate uuids from list
          mockDataSetUUIDList = results.filter(
            function(elem, pos) {
              return results.indexOf(elem) == pos;
          });
      });
    }
  ).then(
    function(){
      //delete all datasets
      return async.eachSeries(mockDataSetUUIDList,
        function(uuid, callback) {
          return restclient.deleteData(
            clientUUID,
            apiToken,
            uuid
          ).then(function(deleteDataResposne){
            apiToken = deleteDataResposne.entity['token'];
            return callback();
          });
        },
        function(err){
          callback(mockDataSetUUIDList);
        });
  });
};

//exports['version'] = {
//  setUp: function(done) {
//    // setup here
//    done();
//  },
//  'no-args': function(test) {
//    test.expect(3);
//    restclient.version().then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 200, 'get version should succeed');
//          try {
//            test.ok('version' in data.entity,
//              'version should be stated');
//          } catch (e) {
//            console.log(e.message);
//            console.log("Body was: " + JSON.stringify(data.entity));
//          }
//        });
//        test.done();
//      });
//  }
//};
//
//exports['authenticate'] = {
//  setUp: function(done) {
//    // setup here
//    done();
//  },
//  'no-args': function(test) {
//    test.expect(3);
//    restclient.authenticate(
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'login should fail');
//          test.equal(data.entity, 'Invalid credentials', 'login body text');
//        });
//        test.done();
//      });
//  },
//  'admin': function(test) {
//    test.expect(9);
//    goodLogin(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'login should succeed');
//          test.notEqual('email_address' in data.entity['response'],
//            'login response email address should be stated');
//          test.notEqual('first_name' in data.entity['response'],
//            'login response first name should be stated');
//          test.ok('last_name' in data.entity['response'],
//            'login response last name should be stated');
//          test.ok('access' in data.entity['response'],
//            'login response user access should be stated');
//        });
//        test.done();
//      });
//  }
//};
//
//exports['adminAuthenticate'] = {
//  setUp: function(done) {
//    // setup here
//    done();
//  },
//  'no-args': function(test) {
//    test.expect(3);
//    restclient.adminAuthenticate(
//      null,
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'login should fail');
//          test.equal(data.entity, 'Invalid credentials', 'login body text');
//        });
//        test.done();
//      });
//  },
//  'admin': function(test) {
//    test.expect(9);
//    restclient.adminAuthenticate(
//      clientUUID,
//      'admin@example.com',
//      'adminpassword',
//      'basicuser@example.com'
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'login should succeed');
//          test.notEqual('email_address' in data.entity['response'],
//            'login response email address should be stated');
//          test.notEqual('first_name' in data.entity['response'],
//            'login response first name should be stated');
//          test.ok('last_name' in data.entity['response'],
//            'login response last name should be stated');
//          test.ok('access' in data.entity['response'],
//            'login response user access should be stated');
//        });
//
//        // log back in as the admin account so the next test passes
//        goodLogin(function() {
//          test.done();
//        });
//      });
//  }
//};
//
//exports['listAccessLevels'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.listAccessLevels(
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'access level list should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(8);
//    restclient.listAccessLevels(
//      clientUUID,
//      apiToken
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'access level list should succeed');
//          test.ok(Array.isArray(data.entity['response']),
//            'access level list should be an array');
//          test.ok(data.entity['response'].length > 0,
//            'at least one access level should exist');
//          test.notEqual(data.entity['response'].indexOf('Manage Clients'), -1,
//            'testing sentinel access level should exist');
//        });
//        test.done();
//      });
//  }
//};
//
//exports['getAccessLevel'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.getAccessLevel(
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'access level get should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  // TODO -- implement test for specifying nonexistent access level
//  'manage-clients': function(test) {
//    test.expect(9);
//    restclient.getAccessLevel(
//      clientUUID,
//      apiToken,
//      'Manage Clients'
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'access level get should succeed');
//          test.ok('description' in data.entity['response'],
//            'description should be stated');
//          test.ok('date_modified' in data.entity['response'],
//            'date modified should be stated');
//          test.ok('date_created' in data.entity['response'],
//            'date created should be stated');
//          test.equal(data.entity['response']['description'], 'Manage Clients',
//            'testing sentinel access level should match');
//        });
//        test.done();
//      });
//  }
//};
//
//exports['listClients'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.listClients(
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'client list get should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(8);
//    restclient.listClients(
//      clientUUID,
//      apiToken
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'client list should succeed');
//          test.ok(Array.isArray(data.entity['response']),
//            'client list should be an array');
//          test.ok(data.entity['response'].length > 0,
//            'at least one client should exist');
//          test.notEqual(data.entity['response'].indexOf('Chevron'), -1,
//            'testing sentinel client should exist');
//        });
//        test.done();
//      });
//  }
//};
//
//exports['getClient'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.getClient(
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'get client get should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  // TODO -- implement test for specifying nonexistent client
//  'with-api-token': function(test) {
//    test.expect(9);
//    restclient.getClient(
//      clientUUID,
//      apiToken,
//      'Chevron'
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'get client should succeed');
//          test.ok('name' in data.entity['response'],
//            'name should be stated');
//          test.ok('date_modified' in data.entity['response'],
//            'date modified should be stated');
//          test.ok('date_created' in data.entity['response'],
//            'date created should be stated');
//          test.equal(data.entity['response']['name'], 'Chevron',
//            'testing sentinel client name should match');
//        });
//        test.done();
//      });
//  }
//};
//
//exports['listClientLocations'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.listClientLocations(
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'list client locations get should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(8);
//    restclient.listClientLocations(
//      clientUUID,
//      apiToken,
//      'Chevron'
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'client list should succeed');
//          test.ok(Array.isArray(data.entity['response']),
//            'locations list should be an array');
//          test.ok(data.entity['response'].length > 0,
//            'at least one location should exist');
//
//          test.notEqual(data.entity['response'].indexOf('Kern River'), -1,
//            'testing client sentinel location should exist');
//        });
//        test.done();
//      });
//  }
//};
//
//exports['listData'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.listData(
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'list data get should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(13);
//    restclient.listData(
//      clientUUID,
//      apiToken
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'list data should succeed');
//          test.ok(Array.isArray(data.entity['response']),
//            'data list should be an array');
//          test.ok(data.entity['response'].length > 0,
//            'at least one data-set should exist');
//          test.ok('uuid' in data.entity['response'][0],
//            'data-set uuid should be stated');
//          test.ok('date_created' in data.entity['response'][0],
//            'data-set date created should be stated');
//          test.ok('created_by' in data.entity['response'][0],
//            'data-set created-by should be stated');
//          test.ok('data' in data.entity['response'][0],
//            'data-set data should be stated');
//          test.ok(Array.isArray(data.entity['response'][0]['data']),
//            'data-set data should be an array');
//          test.ok(data.entity['response'][0]['data'].length > 0,
//            'at least one data-set data item should exist');
//        });
//        test.done();
//      });
//  }
//};
//
//// GOTCHA -- test submitData before getData so we know we have a dataset to
//// validate against
//exports['submitData'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.submitData(
//      null,
//      null,
//      new Date(),
//      null,
//      [restclient.PrimitiveData('boolean', 'placeholder', false)]
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'submit data get should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'null-date': function(test) {
//    test.expect(1);
//    test.throws(function() {
//      restclient.submitData(
//        clientUUID,
//        apiToken,
//        null,
//        'anyone@anywhere',
//        []
//      ).then(
//        function(data) {
//          // doesn't matter, callback shouldn't run
//        });
//      },
//      'Date created must be specified',
//      'error thrown when dateCreated null');
//    test.done();
//  },
//  'no-data': function(test) {
//    test.expect(1);
//    test.throws(function() {
//      restclient.submitData(
//        clientUUID,
//        apiToken,
//        new Date(),
//        'anyone@anywhere',
//        []
//      ).then(
//        function(data) {
//          // doesn't matter, callback shouldn't run
//        });
//      },
//      'Data items must be an array of Attachment and PrimitiveData ' +
//        'and contain at least one item',
//      'error thrown when dataItems empty');
//    test.done();
//  },
//  'bad-data': function(test) {
//    test.expect(1);
//    test.throws(function() {
//      restclient.submitData(
//        clientUUID,
//        apiToken,
//        new Date(),
//        'anyone@anywhere',
//        [{value: 'ploop'}]
//      ).then(
//        function(data) {
//          // doesn't matter, callback shouldn't run
//        });
//    },
//    'Invalid data item at position 0: ' +
//      'must be of type Attachment or PrimitiveData',
//    'error thrown when bad dataItems submitted');
//    test.done();
//  },
//  'good-data': function(test) {
//    test.expect(15);
//    restclient.submitData(
//      clientUUID,
//      apiToken,
//      new Date(),
//      'admin@example.com',
//      [{type: 'boolean', description: 'test data', value: true}]
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 201, 'submit data should succeed');
//          test.ok('uuid' in data.entity['response'],
//            'data-set uuid should be stated');
//          test.ok('date_created' in data.entity['response'],
//            'data-set date created should be stated');
//          test.ok('created_by' in data.entity['response'],
//            'data-set created-by should be stated');
//          test.ok('data' in data.entity['response'],
//            'data-set data should be stated');
//          test.ok(Array.isArray(data.entity['response']['data']),
//            'data-set data should be an array');
//          test.equal(data.entity['response']['data'].length, 1,
//            'one data item should exist');
//          test.equal(data.entity['response']['created_by'],
//            'admin@example.com',
//            'email should match submitted value');
//          test.equal(data.entity['response']['data'][0]['type'],
//            'boolean',
//            'data type should match submitted value');
//          test.equal(data.entity['response']['data'][0]['description'],
//            'test data',
//            'data description should match submitted value');
//          test.equal(data.entity['response']['data'][0]['value'],
//            true,
//            'data value should match submitted value');
//          createdUUID = data.entity['response']['uuid'];
//        });
//        test.done();
//      });
//  },
//  'some-good-some-bad-data': function(test) {
//    test.expect(6);
//
//    var datasetWithAttachmentUUID;
//    var attachment = restclient.Attachment("goodFile.csv", "text/csv", "");
//
//    restclient.submitData(
//        clientUUID,
//        apiToken,
//        new Date(),
//        'admin@example.com',
//        [ attachment,
//          {type: 'boolean', description: 'test data', value: true},
//          {type: null, description: 'null data', value: null}
//        ]
//    ).then(
//      function(submitDataResponse) {
//        test.doesNotThrow( function() {
//          test.doesNotThrow( function() {
//            apiToken = submitDataResponse.entity['token'] || apiToken;
//            test.equal(submitDataResponse.status.code, 409, 'submit data should fail with code 409');
//          });
//        });
//
//        return restclient.listAttachments(
//          clientUUID,
//          apiToken,
//          { limit: 20,
//            offset: 10,
//            order_by: "date_created",
//            order: "desc" });
//      }
//    ).then(
//      function(listAttachmentResponse) {
//        test.doesNotThrow( function() {
//          test.equal(listAttachmentResponse.entity['response']['attachments'].length, 0,
//            'should return exactly 0 attachments');
//          test.equal(listAttachmentResponse.entity['response']['result_count'], 0,
//            'should return result count of exactly 0 attachments');
//        });
//        test.done();
//    });
//  },
//};
//
//exports['getData'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.getData(
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'get data get should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  // TODO -- implement test for specifying nonexistent data
//  'with-api-token': function(test) {
//    test.expect(12);
//    restclient.getData(
//      clientUUID,
//      apiToken,
//      createdUUID
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'get data should succeed');
//          test.ok('uuid' in data.entity['response'],
//            'data-set uuid should be stated');
//          test.ok('date_created' in data.entity['response'],
//            'data-set date created should be stated');
//          test.ok('created_by' in data.entity['response'],
//            'data-set created-by should be stated');
//          test.ok('data' in data.entity['response'],
//            'data-set data should be stated');
//          test.ok(Array.isArray(data.entity['response']['data']),
//            'data-set data should be an array');
//          test.ok(data.entity['response']['data'].length > 0,
//            'at least one data item should exist');
//          test.equal(data.entity['response']['uuid'],
//            createdUUID,
//            'testing sentinel data-set uuid should match');
//        });
//        test.done();
//      });
//  }
//};
//
//exports['deleteData'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.deleteData(
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'delete data should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(6);
//    restclient.deleteData(
//      clientUUID,
//      apiToken,
//      createdUUID
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'delete data should succeed');
//          test.equal(data.entity['response'], 'OK', 'success response');
//        });
//        test.done();
//      });
//  }
//};
//
//exports['deleteTag'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(2);
//    restclient.deleteTag(
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.equal(data.status.code, 401, 'delete data should fail');
//        test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(11);
//
//    var datasetWithAttachmentUUID;
//    var attachment = restclient.Attachment("testDeleteTag.csv", "text/csv", "");
//    var primitive = restclient.PrimitiveData("text", "deletedTag", "deletedValue");
//
//    restclient.submitData(
//      clientUUID,
//      apiToken,
//      new Date(),
//      'admin@example.com',
//      [attachment, primitive]
//    ).then(
//      function(submitDataResponse) {
//        test.doesNotThrow( function() {
//          apiToken = submitDataResponse.entity['token'];
//          datasetWithAttachmentUUID = submitDataResponse.entity['response']['uuid'];
//        });
//
//        return restclient.listAttachments(
//            clientUUID,
//            apiToken,
//            {or_search_strings: ["deletedvalue"]}
//        );
//      }
//    ).then(
//      function(listAttachmentResponse) {
//        test.doesNotThrow( function() {
//          apiToken = listAttachmentResponse.entity['token'];
//          datasetWithAttachmentUUID =
//            listAttachmentResponse.entity['response']['attachments'][0]['data_set_uuid'];
//          test.equal(listAttachmentResponse.entity['response']['attachments'].length, 1,
//            'should return exactly 0 attachments');
//        });
//
//        return restclient.deleteTag(
//          clientUUID,
//          apiToken,
//          datasetWithAttachmentUUID,
//          "text",
//          "deletedTag"
//        );
//      }
//    ).then(
//      function(deleteTagResponse) {
//        test.doesNotThrow( function() {
//          apiToken = deleteTagResponse.entity['token'];
//          test.equal(deleteTagResponse.status.code, 200, 'delete data should succeed with 200 status');
//          checkResponse(test, deleteTagResponse.entity);
//          test.equal(deleteTagResponse.entity['response'], 'OK', 'success response');
//        });
//
//        return restclient.listAttachments(
//            clientUUID,
//            apiToken,
//            {or_search_strings: ["deletedvalue"]}
//        );
//      }
//    ).then(
//      function(listAttachentResponse) {
//        test.doesNotThrow( function() {
//          test.equal(listAttachentResponse.entity['response']['attachments'].length, 0,
//            'should return exactly 0 attachments');
//        });
//        test.done();
//    });
//  },
//  'bad-parameters': function(test) {
//    test.expect(3);
//    restclient.deleteTag(
//        clientUUID,
//        apiToken,
//        null,
//        null,
//      null
//    ).then(
//      function(deleteTagResponse) {
//        test.doesNotThrow( function() {
//          test.equal(deleteTagResponse.status.code, 409, 'deleteTag should fail with 409 status');
//          test.equal(deleteTagResponse.entity['response'], 'Failure', 'response should be Failure');
//        });
//        test.done()
//      });
//  },
//};
//
//exports['listUsers'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.listUsers(
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'list users should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(8);
//    restclient.listUsers(
//      clientUUID,
//      apiToken
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'list users should succeed');
//          test.ok(Array.isArray(data.entity['response']),
//            'user list should be an array');
//          test.ok(data.entity['response'].length > 0,
//            'at least one user should exist');
//          test.notEqual(data.entity['response'].indexOf('admin@example.com'), -1,
//            'VPN account should exist');
//        });
//        test.done();
//      });
//  }
//};
//
//exports['getUser'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.getUser(
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'get user should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(9);
//    restclient.getUser(
//      clientUUID,
//      apiToken,
//      'admin@example.com'
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'get user should succeed');
//          test.ok('email_address' in data.entity['response'],
//            'email_address should be stated');
//          test.ok('date_created' in data.entity['response'],
//            'date created should be stated');
//          test.ok('date_modified' in data.entity['response'],
//            'date modified should be stated');
//          test.equal(data.entity['response']['email_address'],
//            'admin@example.com',
//            'email should match request value');
//        });
//        test.done();
//      });
//  }
//};
//
//exports['listUserAccess'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.listUserAccess(
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'list user access should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(8);
//    restclient.listUserAccess(
//      clientUUID,
//      apiToken,
//      'admin@example.com'
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'list user access should succeed');
//          test.ok(Array.isArray(data.entity['response']),
//            'user access list should be an array');
//          test.ok(data.entity['response'].length > 0,
//            'at least one user access should exist');
//          test.notEqual(data.entity['response'].indexOf('Manage Users'), -1,
//            'Manage Users access level should exist');
//        });
//        test.done();
//      });
//  }
//};
//
//exports['listAttachments'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.listAttachments(
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'list data get should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(13);
//
//    var attachments = [];
//    var datasetWithAttachmentUUID;
//
//    // create mock attachments to query for.
//    var i = 0;
//    while (i < 30) {
//      attachments.push(restclient.Attachment(
//            "testListAttachmentItems" + i.toString() + ".csv", "text/csv", ""));
//      i++;
//    }
//
//    // sumbit dataset with mock attachments.
//    restclient.submitData(
//      clientUUID,
//      apiToken,
//      new Date(),
//      'admin@example.com',
//      attachments
//    ).then(
//      function(submitResponse) {
//
//        test.doesNotThrow( function() {
//          apiToken = submitResponse.entity['token'];
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//        });
//
//        // retrieved submitted mock attachments.
//        return restclient.listAttachments(
//          clientUUID,
//          apiToken,
//          {limit: 20,
//           offset: 10,
//           search_string: "testListAttachmentItem",
//           order_by: "date_created",
//           order: "desc"}
//        );
//      }
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          apiToken = data.entity['token'];
//          checkResponse(test, data.entity);
//          test.equal(data.status.code, 200, 'list data should succeed');
//          test.ok(Array.isArray(data.entity['response']['attachments']),
//            'data list should be an array');
//          test.equal(data.entity['response']['attachments'].length, 20,
//            'should return exactly 20 attachments');
//          test.equal(data.entity['response']['result_count'], 30,
//            'should return result count of exactly 30 attachments');
//          test.ok('data_set_uuid' in data.entity['response']['attachments'][0],
//            'data set uuid should be stated');
//          test.ok('date_created' in data.entity['response']['attachments'][0],
//            'attachment date created should be stated');
//          test.ok('created_by' in data.entity['response']['attachments'][0],
//            'attachment created-by should be stated');
//          test.ok('filename' in data.entity['response']['attachments'][0],
//            'attachment filename should be stated');
//        });
//        test.done();
//    });
//  },
//  'with-api-token-search-filename': function(test) {
//    test.expect(16);
//
//    var datasetWithAttachmentUUID;
//    var attachment = restclient.Attachment("findThis.csv", "text/csv", "");
//
//    submitMockData([attachment]
//    ).then(
//      function(submitResponse) {
//
//        test.doesNotThrow( function() {
//          apiToken = submitResponse.entity['token'];
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//        });
//        return restclient.listAttachments(
//            clientUUID,
//            apiToken,
//            {or_search_strings: ["this.csv"]}
//        );
//      }
//    ).then(
//      function(getListResponse) {
//        test.doesNotThrow( function() {
//          apiToken = getListResponse.entity['token'];
//          checkResponse(test, getListResponse.entity);
//          test.equal(getListResponse.status.code, 200,
//            'list data should succeed');
//          test.ok('attachments' in getListResponse.entity['response'],
//            'attachments data should be stated');
//          test.ok('result_count' in getListResponse.entity['response'],
//            'result count should be stated');
//          test.ok(Array.isArray(getListResponse.entity['response']['attachments']),
//            'attachment list should be an array');
//          test.ok(getListResponse.entity['response']['attachments'].length > 0,
//            'there should be at least one attachments');
//          test.ok(getListResponse.entity['response']['result_count'] > 0,
//            'result count should be a least 1');
//          test.ok('data_set_uuid' in getListResponse.entity['response']['attachments'][0],
//            'data-set_uuid should be stated');
//          test.ok('date_created' in getListResponse.entity['response']['attachments'][0],
//            'attachment date created should be stated');
//          test.ok('created_by' in getListResponse.entity['response']['attachments'][0],
//            'attachment created-by should be stated');
//          test.ok(getListResponse.entity['response']['attachments'][0]['filename'] === 'findThis.csv',
//            'filename should be called "test.csv"');
//          test.ok(getListResponse.entity['response']['attachments'][0]['created_by'] === 'admin@example.com',
//            'created_by should be "admin@example.com"');
//        });
//        test.done();
//    });
//  },
//  'with-api-token-search-primitive-value': function(test) {
//    test.expect(16);
//
//    var datasetWithAttachmentUUID;
//    var attachment = restclient.Attachment("test.csv", "text/csv", "");
//    var primitive = restclient.PrimitiveData("text", "description", "findThisValue");
//
//    submitMockData( [attachment, primitive]
//    ).then(
//      function(submitResponse) {
//        test.doesNotThrow( function() {
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//          apiToken = submitResponse.entity['token'];
//        });
//
//        return restclient.listAttachments(
//            clientUUID,
//            apiToken,
//            {or_search_strings: ["thisvalue"]}
//        );
//      }
//    ).then(
//      function(getListResponse) {
//        test.doesNotThrow( function() {
//          apiToken = getListResponse.entity['token'];
//          checkResponse(test, getListResponse.entity);
//          test.equal(getListResponse.status.code, 200,
//            'list data should succeed');
//          test.ok('attachments' in getListResponse.entity['response'],
//            'attachments data should be stated');
//          test.ok('result_count' in getListResponse.entity['response'],
//            'result count should be stated');
//          test.ok(Array.isArray(getListResponse.entity['response']['attachments']),
//            'attachment list should be an array');
//          test.ok(getListResponse.entity['response']['attachments'].length > 0,
//            'there should be at least one attachment');
//          test.ok(getListResponse.entity['response']['result_count'] > 0,
//            'result count should be a least 1');
//          test.ok('data_set_uuid' in getListResponse.entity['response']['attachments'][0],
//            'data-set_uuid should be stated');
//          test.ok('date_created' in getListResponse.entity['response']['attachments'][0],
//            'attachment date created should be stated');
//          test.ok('created_by' in getListResponse.entity['response']['attachments'][0],
//            'attachment created-by should be stated');
//          test.ok(getListResponse.entity['response']['attachments'][0]['filename'] === 'test.csv',
//            'filename should be called "test.csv"');
//          test.ok(getListResponse.entity['response']['attachments'][0]['created_by'] === 'admin@example.com',
//            'created_by should be "admin@example.com"');
//        });
//        test.done();
//    });
//  },
//  'with-api-token-search-created-by': function(test) {
//    test.expect(16);
//
//    var datasetWithAttachmentUUID;
//    var attachment = restclient.Attachment("test.csv", "text/csv", "");
//
//    submitMockData( [attachment]
//    ).then(
//      function(submitResponse) {
//        test.doesNotThrow( function() {
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//          apiToken = submitResponse.entity['token'];
//        });
//        return restclient.listAttachments(
//            clientUUID,
//            apiToken,
//            {or_search_strings: ["admin"]}
//        );
//      }
//    ).then(
//      function(getListResponse) {
//        test.doesNotThrow( function() {
//          apiToken = getListResponse.entity['token'];
//          checkResponse(test, getListResponse.entity);
//          test.equal(getListResponse.status.code, 200,
//            'list data should succeed');
//          test.ok('attachments' in getListResponse.entity['response'],
//            'attachments data should be stated');
//          test.ok('result_count' in getListResponse.entity['response'],
//            'result count should be stated');
//          test.ok(Array.isArray(getListResponse.entity['response']['attachments']),
//            'attachment list should be an array');
//          test.ok(getListResponse.entity['response']['attachments'].length > 0,
//            'there should be at least one attachments');
//          test.ok(getListResponse.entity['response']['result_count'] > 0,
//            'result count should be a least 1');
//          test.ok('data_set_uuid' in getListResponse.entity['response']['attachments'][0],
//            'data-set_uuid should be stated');
//          test.ok('date_created' in getListResponse.entity['response']['attachments'][0],
//            'attachment date created should be stated');
//          test.ok('created_by' in getListResponse.entity['response']['attachments'][0],
//            'attachment created-by should be stated');
//          test.ok(getListResponse.entity['response']['attachments'][0]['filename'] === 'test.csv',
//            'filename should be called "test.csv"');
//          test.ok(getListResponse.entity['response']['attachments'][0]['created_by'] === 'admin@example.com',
//            'created_by should be "admin@example.com"');
//        });
//        test.done();
//    });
//  },
//  'with-api-token-search-tag-name-and-tag-value': function(test) {
//    test.expect(31);
//
//    var datasetWithAttachmentUUID;
//    var attachment = restclient.Attachment("test.csv", "text/csv", "");
//    var primitive = restclient.PrimitiveData("text", "thisTag", "thisValue");
//
//    submitMockData( [attachment, primitive]
//    ).then(
//      function(submitResponse) {
//
//        test.doesNotThrow( function() {
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//          apiToken = submitResponse.entity['token'];
//        });
//
//        return restclient.listAttachments(
//            clientUUID,
//            apiToken,
//            {tag_name: "thisTag"}
//        );
//      }
//    ).then(
//      function(getListResponseTagName) {
//        test.doesNotThrow( function() {
//          apiToken = getListResponseTagName.entity['token'];
//          checkResponse(test, getListResponseTagName.entity);
//          test.equal(getListResponseTagName.status.code, 200,
//            'list data should succeed');
//          test.ok('attachments' in getListResponseTagName.entity['response'],
//            'attachments data should be stated');
//          test.ok('result_count' in getListResponseTagName.entity['response'],
//            'result count should be stated');
//          test.ok(Array.isArray(getListResponseTagName.entity['response']['attachments']),
//            'attachment list should be an array');
//          test.ok(getListResponseTagName.entity['response']['attachments'].length > 0,
//            'there should be at least one attachments');
//          test.ok(getListResponseTagName.entity['response']['result_count'] > 0,
//            'result count should be a least 1');
//          test.ok('data_set_uuid' in getListResponseTagName.entity['response']['attachments'][0],
//            'data-set_uuid should be stated');
//          test.ok('date_created' in getListResponseTagName.entity['response']['attachments'][0],
//            'attachment date created should be stated');
//          test.ok('created_by' in getListResponseTagName.entity['response']['attachments'][0],
//            'attachment created-by should be stated');
//          test.ok(getListResponseTagName.entity['response']['attachments'][0]['filename'] === 'test.csv',
//            'filename should be called "test.csv"');
//          test.ok(getListResponseTagName.entity['response']['attachments'][0]['created_by'] === 'admin@example.com',
//            'created_by should be "admin@example.com"');
//        });
//        return restclient.listAttachments(
//            clientUUID,
//            apiToken,
//            {or_search_strings: ["thisValue"]}
//        );
//      }
//    ).then(
//      function(getListResponseTagValue) {
//        test.doesNotThrow( function() {
//          apiToken = getListResponseTagValue.entity['token'];
//          checkResponse(test, getListResponseTagValue.entity);
//          test.equal(getListResponseTagValue.status.code, 200,
//            'list data should succeed');
//          test.ok('attachments' in getListResponseTagValue.entity['response'],
//            'attachments data should be stated');
//          test.ok('result_count' in getListResponseTagValue.entity['response'],
//            'result count should be stated');
//          test.ok(Array.isArray(getListResponseTagValue.entity['response']['attachments']),
//            'attachment list should be an array');
//          test.ok(getListResponseTagValue.entity['response']['attachments'].length > 0,
//            'there should be at least one attachments');
//          test.ok(getListResponseTagValue.entity['response']['result_count'] > 0,
//            'result count should be a least 1');
//          test.ok('data_set_uuid' in getListResponseTagValue.entity['response']['attachments'][0],
//            'data-set_uuid should be stated');
//          test.ok('date_created' in getListResponseTagValue.entity['response']['attachments'][0],
//            'attachment date created should be stated');
//          test.ok('created_by' in getListResponseTagValue.entity['response']['attachments'][0],
//            'attachment created-by should be stated');
//          test.ok(getListResponseTagValue.entity['response']['attachments'][0]['filename'] === 'test.csv',
//            'filename should be called "test.csv"');
//          test.ok(getListResponseTagValue.entity['response']['attachments'][0]['created_by'] === 'admin@example.com',
//            'created_by should be "admin@example.com"');
//        });
//
//        test.done();
//    });
//  },
//  'with-api-token-search-delimiter-logic': function(test) {
//    test.expect(61);
//
//
//    var datasetWithAttachment1UUID;
//    var attachment1 = restclient.Attachment("file1.csv", "text/csv", "");
//    var primitive1 = restclient.PrimitiveData("text", "tag1", "value1");
//
//    var datasetWithAttachment2UUID;
//    var attachment2 = restclient.Attachment("file2.csv", "text/csv", "");
//    var primitive2 = restclient.PrimitiveData("text", "tag2", "value2");
//
//    var datasetWithAttachment3UUID;
//    var attachment3 = restclient.Attachment("file3.csv", "text/csv", "");
//    var primitive3 = restclient.PrimitiveData("text", "tag3", "value3");
//
//    submitMockData( [attachment1, primitive1]
//    ).then(
//      function(submitResponse) {
//        test.doesNotThrow( function() {
//          datasetWithAttachment1UUID = submitResponse.entity['response']['uuid'];
//          apiToken = submitResponse.entity['token'];
//        });
//
//        return submitMockData( [attachment2, primitive2]);
//      }
//    ).then(
//      function(submitResponse) {
//
//        test.doesNotThrow( function() {
//          datasetWithAttachment2UUID = submitResponse.entity['response']['uuid'];
//          apiToken = submitResponse.entity['token'];
//        });
//
//        return submitMockData( [attachment3, primitive3]);
//      }
//    ).then(
//      function(submitResponse) {
//
//        test.doesNotThrow( function() {
//          datasetWithAttachment3UUID = submitResponse.entity['response']['uuid'];
//          apiToken = submitResponse.entity['token'];
//        });
//
//        return restclient.listAttachments(
//            clientUUID,
//            apiToken,
//            {or_search_strings: ["file"]}
//        );
//      }
//    ).then(
//      function(getListSearchResponse) {
//        test.doesNotThrow( function() {
//          apiToken = getListSearchResponse.entity['token'];
//          checkResponse(test, getListSearchResponse.entity);
//          test.equal(getListSearchResponse.status.code, 200,
//            'list data should succeed');
//          test.ok('attachments' in getListSearchResponse.entity['response'],
//            'attachments data should be stated');
//          test.ok('result_count' in getListSearchResponse.entity['response'],
//            'result count should be stated');
//          test.ok(Array.isArray(getListSearchResponse.entity['response']['attachments']),
//            'attachment list should be an array');
//          test.equal(getListSearchResponse.entity['response']['attachments'].length, 3,
//            'there should be exactly 3 attachments');
//          test.equal(getListSearchResponse.entity['response']['result_count'], 3,
//            'result count should be exactly 3');
//          test.ok('data_set_uuid' in getListSearchResponse.entity['response']['attachments'][0],
//            'data-set_uuid should be stated');
//          test.ok('date_created' in getListSearchResponse.entity['response']['attachments'][0],
//            'attachment date created should be stated');
//          test.ok('created_by' in getListSearchResponse.entity['response']['attachments'][0],
//            'attachment created-by should be stated');
//          test.ok(getListSearchResponse.entity['response']['attachments'][0]['created_by'] === 'admin@example.com',
//            'created_by should be "admin@example.com"');
//        });
//
//        return restclient.listAttachments(
//            clientUUID,
//            apiToken,
//            { or_search_strings: ["file"],
//              not_search_strings: ["value2"],
//            }
//        );
//      }
//    ).then(
//      function(getListSearchResponse) {
//        test.doesNotThrow( function() {
//          apiToken = getListSearchResponse.entity['token'];
//          checkResponse(test, getListSearchResponse.entity);
//          test.equal(getListSearchResponse.status.code, 200,
//            'list data should succeed');
//          test.ok('attachments' in getListSearchResponse.entity['response'],
//            'attachments data should be stated');
//          test.ok('result_count' in getListSearchResponse.entity['response'],
//            'result count should be stated');
//          test.ok(Array.isArray(getListSearchResponse.entity['response']['attachments']),
//            'attachment list should be an array');
//          test.equal(getListSearchResponse.entity['response']['attachments'].length, 2,
//            'there should be exactly 3 attachments');
//          test.equal(getListSearchResponse.entity['response']['result_count'], 2,
//            'result count should be exactly 3');
//          test.ok('data_set_uuid' in getListSearchResponse.entity['response']['attachments'][0],
//            'data-set_uuid should be stated');
//          test.ok('date_created' in getListSearchResponse.entity['response']['attachments'][0],
//            'attachment date created should be stated');
//          test.ok('created_by' in getListSearchResponse.entity['response']['attachments'][0],
//            'attachment created-by should be stated');
//          test.ok(getListSearchResponse.entity['response']['attachments'][0]['created_by'] === 'admin@example.com',
//            'created_by should be "admin@example.com"');
//        });
//
//        return restclient.listAttachments(
//            clientUUID,
//            apiToken,
//            { or_search_strings: ["file"],
//              and_search_strings: ["value3"],
//            }
//        );
//      }
//    ).then(
//      function(getListSearchResponse) {
//        test.doesNotThrow( function() {
//          apiToken = getListSearchResponse.entity['token'];
//          checkResponse(test, getListSearchResponse.entity);
//          test.equal(getListSearchResponse.status.code, 200,
//            'list data should succeed');
//          test.ok('attachments' in getListSearchResponse.entity['response'],
//            'attachments data should be stated');
//          test.ok('result_count' in getListSearchResponse.entity['response'],
//            'result count should be stated');
//          test.ok(Array.isArray(getListSearchResponse.entity['response']['attachments']),
//            'attachment list should be an array');
//          test.equal(getListSearchResponse.entity['response']['attachments'].length, 1,
//            'there should be exactly 1 attachments');
//          test.equal(getListSearchResponse.entity['response']['result_count'], 1,
//            'result count should be exactly 1');
//          test.ok('data_set_uuid' in getListSearchResponse.entity['response']['attachments'][0],
//            'data-set_uuid should be stated');
//          test.ok('date_created' in getListSearchResponse.entity['response']['attachments'][0],
//            'attachment date created should be stated');
//          test.ok('created_by' in getListSearchResponse.entity['response']['attachments'][0],
//            'attachment created-by should be stated');
//          test.ok(getListSearchResponse.entity['response']['attachments'][0]['filename'] === 'file3.csv',
//            'filename should be called "file3.csv"');
//          test.ok(getListSearchResponse.entity['response']['attachments'][0]['created_by'] === 'admin@example.com',
//            'created_by should be "admin@example.com"');
//        });
//
//        return restclient.listAttachments(
//            clientUUID,
//            apiToken,
//            { or_search_strings: ["csv"],
//              and_search_strings: ["value1"],
//              not_search_strings: ["file2"],
//            }
//        );
//      }
//    ).then(
//      function(getListSearchResponse) {
//        test.doesNotThrow( function() {
//          apiToken = getListSearchResponse.entity['token'];
//          checkResponse(test, getListSearchResponse.entity);
//          test.equal(getListSearchResponse.status.code, 200,
//            'list data should succeed');
//          test.ok('attachments' in getListSearchResponse.entity['response'],
//            'attachments data should be stated');
//          test.ok('result_count' in getListSearchResponse.entity['response'],
//            'result count should be stated');
//          test.ok(Array.isArray(getListSearchResponse.entity['response']['attachments']),
//            'attachment list should be an array');
//          test.equal(getListSearchResponse.entity['response']['attachments'].length, 1,
//            'there should be exactly 1 attachments');
//          test.equal(getListSearchResponse.entity['response']['result_count'], 1,
//            'result count should be exactly 1');
//          test.ok('data_set_uuid' in getListSearchResponse.entity['response']['attachments'][0],
//            'data-set_uuid should be stated');
//          test.ok('date_created' in getListSearchResponse.entity['response']['attachments'][0],
//            'attachment date created should be stated');
//          test.ok('created_by' in getListSearchResponse.entity['response']['attachments'][0],
//            'attachment created-by should be stated');
//          test.ok(getListSearchResponse.entity['response']['attachments'][0]['filename'] === 'file1.csv',
//            'filename should be called "file1.csv"');
//          test.ok(getListSearchResponse.entity['response']['attachments'][0]['created_by'] === 'admin@example.com',
//            'created_by should be "admin@example.com"');
//        });
//
//        test.done();
//      }
//    );
//  },
//};
//
//exports['getAttachment'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(2);
//    restclient.getAttachment(
//      null,
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'list data get should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(3);
//
//    var attachmentFilename,
//        datasetWithAttachmentUUID,
//        attachment = restclient.Attachment("test.csv", "text/csv", ""),
//        primitiveData =
//          restclient.PrimitiveData('text', 'testTextDescription','testValue');
//
//    submitMockData( [attachment, primitiveData]
//    ).then(
//      function(submitResponse) {
//        test.doesNotThrow( function() {
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//          attachmentFilename = submitResponse.entity['response']['data'][0]['filename']
//          apiToken = submitResponse.entity['token'];
//        });
//
//        return restclient.getAttachment(
//            clientUUID,
//            apiToken,
//            datasetWithAttachmentUUID,
//            "test.csv"
//        );
//      }
//    ).then(
//      function(getResponse) {
//        test.doesNotThrow( function() {
//          var headers = getResponse.headers;
//          test.equal(getResponse.status.code, 200,
//            'get attachment should succeed');
//          test.equal(headers['Content-Disposition'],
//            "attachment;filename='test.csv'",
//            'invalid Content-Disposition text');
//          test.equal(headers['Content-Type'],
//            "text/csv",
//            'invalid Content-Disposition text');
//        });
//        test.done();
//    });
//  },
//  'file-not-found': function(test) {
//    test.expect(1);
//
//    var attachmentFilename,
//        datasetWithAttachmentUUID,
//        attachment = restclient.Attachment("test.csv", "text/csv", ""),
//        primitiveData =
//          restclient.PrimitiveData('text', 'testTextDescription','testValue');
//
//    submitMockData( [attachment, primitiveData]
//    ).then(
//      function(submitResponse) {
//        test.doesNotThrow( function() {
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//          attachmentFilename = submitResponse.entity['response']['data'][0]['filename']
//          apiToken = submitResponse.entity['token'];
//        });
//
//        return restclient.getAttachment(
//            clientUUID,
//            apiToken,
//            datasetWithAttachmentUUID,
//            "notFound.csv"
//        );
//      }
//    ).then(
//      function(getResponse) {
//        test.doesNotThrow( function() {
//          test.equal(getResponse.status.code, 404,
//            'get attachment should fail with 404');
//        });
//        test.done();
//    });
//  },
//  'file-restricted-access': function(test) {
//    test.expect(5);
//
//    var attachmentFilename,
//        datasetWithAttachmentUUID,
//        attachment = restclient.Attachment("restricted.csv", "text/csv", "");
//
//    //submit attachment as admin
//    submitMockData( [attachment]
//    ).then(
//      function(submitResponse) {
//        test.doesNotThrow( function() {
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//          apiToken = submitResponse.entity['token'];
//        });
//
//        //login as restricted user
//        return restclient.adminAuthenticate(
//          clientUUID,
//          'admin@example.com',
//          'adminpassword',
//          'basicuser@example.com'
//        );
//      }
//    ).then(
//      function(limitedAccessLoginResponse) {
//        test.doesNotThrow( function() {
//          apiToken = limitedAccessLoginResponse.entity['token'];
//          test.equal(limitedAccessLoginResponse.status.code, 200,
//            'login should succeed');
//        });
//
//        //try to retreive attachment as resticted user
//        return restclient.getAttachment(
//            clientUUID,
//            apiToken,
//            datasetWithAttachmentUUID,
//            "restricted.csv"
//        );
//      }
//    ).then(
//      function(getRestrictedResponse) {
//        test.doesNotThrow( function() {
//          test.equal(getRestrictedResponse.status.code, 401,
//            'get attachment should fail with 401');
//        });
//
//        //try to retrieve attachment that doesn't exist as restricted user
//        return restclient.getAttachment(
//            clientUUID,
//            apiToken,
//            datasetWithAttachmentUUID,
//            "notFound.csv"
//        );
//      }
//    ).then(
//      function(getNotFoundResponse) {
//        test.doesNotThrow( function() {
//          test.equal(getNotFoundResponse.status.code, 404,
//            'get attachment should fail with 401');
//        });
//        test.done();
//    });
//  }
//};
//
//exports['getAttachmentInfo'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.getAttachmentInfo(
//      null,
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'list data get should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(18);
//
//    var attachmentFilename,
//        datasetWithAttachmentUUID,
//        attachment = restclient.Attachment("test.csv", "text/csv", ""),
//        primitiveData =
//          restclient.PrimitiveData('text', 'testTextDescription','testValue');
//
//    submitMockData( [attachment, primitiveData]
//    ).then(
//      function(submitResponse) {
//        test.doesNotThrow( function() {
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//          attachmentFilename = submitResponse.entity['response']['data'][0]['filename']
//          apiToken = submitResponse.entity['token'];
//        });
//
//        return restclient.getAttachmentInfo(
//            clientUUID,
//            apiToken,
//            datasetWithAttachmentUUID,
//            attachmentFilename
//        );
//      }
//    ).then(
//      function(getInfoResponse) {
//        test.doesNotThrow( function() {
//          checkResponse(test, getInfoResponse.entity);
//          test.equal(getInfoResponse.status.code, 200,
//            'list data should succeed');
//          test.ok(Array.isArray(getInfoResponse.entity['response']),
//            'data list should be an array');
//          test.ok('data_set_uuid' in getInfoResponse.entity['response'][0],
//            'data-set_uuid should be stated');
//          test.ok('date_created' in getInfoResponse.entity['response'][0],
//            'attachment date created should be stated');
//          test.ok('created_by' in getInfoResponse.entity['response'][0],
//            'attachment created-by should be stated');
//          test.ok('primitive_text_data' in getInfoResponse.entity['response'][0],
//            'primitive text data should be stated');
//          test.ok(Array.isArray(getInfoResponse.entity['response'][0]['primitive_text_data']),
//            'primitive_text_data should be an array');
//          test.ok(getInfoResponse.entity['response'][0]['filename'] === 'test.csv',
//            'filename should be called "test.csv"');
//          test.ok(getInfoResponse.entity['response'][0]['created_by'] === 'admin@example.com',
//            'created_by should be "admin@example.com"');
//          test.ok(getInfoResponse.entity['response'][0]['primitive_text_data'].length === 1,
//            'primitive text data should have 1 element');
//          test.ok(getInfoResponse.entity['response'][0]['primitive_text_data'][0]['type'] === 'text',
//            'primitive text data type should be "text"');
//          test.ok(getInfoResponse.entity['response'][0]['primitive_text_data'][0]['description'] === 'testTextDescription',
//            'primitive text data description should be "testTextDescription"');
//          test.ok(getInfoResponse.entity['response'][0]['primitive_text_data'][0]['value'] === 'testValue',
//            'primitive text data value should be "testValue"');
//        });
//        test.done();
//    });
//  },
//};
//
//exports['getAttachment'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.getAttachment(
//      null,
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'list data get should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(5);
//
//    var attachmentFilename,
//        datasetWithAttachmentUUID,
//        attachment = restclient.Attachment("test.csv", "text/csv", ""),
//        primitiveData =
//          restclient.PrimitiveData('text', 'testTextDescription','testValue');
//
//    submitMockData( [attachment, primitiveData]
//    ).then(
//      function(submitResponse) {
//        test.doesNotThrow( function() {
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//          attachmentFilename = submitResponse.entity['response']['data'][0]['filename']
//          apiToken = submitResponse.entity['token'];
//        });
//
//        return restclient.getAttachment(
//            clientUUID,
//            apiToken,
//            datasetWithAttachmentUUID,
//            "test.csv"
//        );
//      }
//    ).then(
//      function(getResponse) {
//        test.doesNotThrow( function() {
//          var headers = getResponse.headers;
//          test.equal(getResponse.status.code, 200,
//            'get attachment should succeed');
//          test.equal(headers['Content-Disposition'],
//            "attachment;filename='test.csv'",
//            'invalid Content-Disposition text');
//          test.equal(headers['Content-Type'],
//            "text/csv",
//            'invalid Content-Disposition text');
//        });
//        test.done();
//    });
//  },
//  'file-not-found': function(test) {
//    test.expect(3);
//
//    var attachmentFilename,
//        datasetWithAttachmentUUID,
//        attachment = restclient.Attachment("test.csv", "text/csv", ""),
//        primitiveData =
//          restclient.PrimitiveData('text', 'testTextDescription','testValue');
//
//    submitMockData( [attachment, primitiveData]
//    ).then(
//      function(submitResponse) {
//        test.doesNotThrow( function() {
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//          attachmentFilename = submitResponse.entity['response']['data'][0]['filename']
//          apiToken = submitResponse.entity['token'];
//        });
//
//        return restclient.getAttachment(
//            clientUUID,
//            apiToken,
//            datasetWithAttachmentUUID,
//            "notFound.csv"
//        );
//      }
//    ).then(
//      function(getResponse) {
//        test.doesNotThrow( function() {
//          test.equal(getResponse.status.code, 404,
//            'get attachment should fail with 404');
//        });
//        test.done();
//    });
//  },
//  'file-restricted-access': function(test) {
//    test.expect(10);
//
//    var attachmentFilename,
//        datasetWithAttachmentUUID,
//        attachment = restclient.Attachment("restricted.csv", "text/csv", "");
//
//    submitMockData( [attachment]
//    ).then(
//      function(submitResponse) {
//        test.doesNotThrow( function() {
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//          apiToken = submitResponse.entity['token'];
//        });
//
//        //login as restricted user
//        return restclient.adminAuthenticate(
//          clientUUID,
//          'admin@example.com',
//          'adminpassword',
//          'basicuser@example.com'
//        );
//      }
//    ).then(
//      function(limitedAccessLoginResponse) {
//        test.doesNotThrow( function() {
//          apiToken = limitedAccessLoginResponse.entity['token'];
//          test.equal(limitedAccessLoginResponse.status.code, 200,
//            'login should succeed');
//        });
//
//        //try to retreive attachment as resticted user
//        return restclient.getAttachment(
//            clientUUID,
//            apiToken,
//            datasetWithAttachmentUUID,
//            "restricted.csv"
//        );
//      }
//    ).then(
//      function(getRestrictedResponse) {
//        test.doesNotThrow( function() {
//          test.equal(getRestrictedResponse.status.code, 401,
//            'get attachment should fail with 401');
//        });
//
//        //try to retrieve attachment that doesn't exist as restricted user
//        return restclient.getAttachment(
//            clientUUID,
//            apiToken,
//            datasetWithAttachmentUUID,
//            "notFound.csv"
//        );
//      }
//    ).then(
//      function(getNotFoundResponse) {
//        test.doesNotThrow( function() {
//          test.equal(getNotFoundResponse.status.code, 404,
//            'get attachment should fail with 404');
//        });
//
//        //delete mock attachment
//        goodLogin(
//          function(adminLoginResponseData) {
//            test.doesNotThrow( function() {
//              apiToken = adminLoginResponseData.entity['token'];
//            });
//
//            restclient.deleteData(
//              clientUUID,
//              apiToken,
//              datasetWithAttachmentUUID
//            ).then(
//              function(deleteDataResponse) {
//                test.doesNotThrow( function() {
//                  test.equal(deleteDataResponse.status.code, 200,
//                    'delete data should succeed');
//                });
//                test.done();
//            });
//        });
//    });
//  }
//};
//
//exports['replaceAttachment'] = {
//  setUp: function(done) {
//    goodLogin( function(){
//      deleteAllMockData( function(callback) { done(); });
//    });
//  },
//  'no-api-token': function(test) {
//    test.expect(3);
//    restclient.replaceAttachment(
//      null,
//      null,
//      null,
//      null,
//      null
//    ).then(
//      function(data) {
//        test.doesNotThrow( function() {
//          test.equal(data.status.code, 401, 'replace attachment should fail');
//          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
//        });
//        test.done();
//      });
//  },
//  'with-api-token': function(test) {
//    test.expect(8);
//
//    var attachmentFilename,
//        datasetWithAttachmentUUID,
//        attachment = restclient.Attachment("test.csv",
//            "text/csv",
//            "b3JpZ2luYWw=" // "original"
//        ),
//        primitiveData =
//          restclient.PrimitiveData('text', 'testTextDescription','testValue');
//
//    submitMockData( [attachment, primitiveData]
//    ).then(
//      function(submitResponse) {
//        test.doesNotThrow( function() {
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//          attachmentFilename = submitResponse.entity['response']['data'][0]['filename']
//          apiToken = submitResponse.entity['token'];
//        });
//
//        return restclient.replaceAttachment(
//          clientUUID,
//          apiToken,
//          datasetWithAttachmentUUID,
//          attachmentFilename,
//          "bmV3" // "new"
//        );
//      }
//    ).then(
//      function(replaceResponse) {
//        test.doesNotThrow( function() {
//          apiToken = replaceResponse.entity['token'];
//        });
//
//        return restclient.getAttachment(
//          clientUUID,
//          apiToken,
//          datasetWithAttachmentUUID,
//          attachmentFilename
//        );
//      }
//    ).then(
//      function(getResponse) {
//        test.doesNotThrow( function() {
//          var headers = getResponse.headers;
//          test.equal(getResponse.status.code, 200,
//            'get attachment should succeed');
//          test.equal(headers['Content-Disposition'],
//            "attachment;filename='test.csv'",
//            'invalid Content-Disposition text');
//          test.equal(headers['Content-Type'],
//            'text/csv',
//            'invalid Content-Disposition text');
//          test.equal(getResponse.entity,
//            'new',
//            'file contents should have changed!');
//          });
//
//        // delete mock attachments.
//        return restclient.deleteData(
//          clientUUID,
//          apiToken,
//          datasetWithAttachmentUUID
//        );
//      }
//    ).then(
//      function(deleteDataResponse) {
//        test.doesNotThrow( function() {
//          apiToken = deleteDataResponse.entity['token'];
//        });
//        test.done();
//      }
//    );
//  },
//  'file-not-found': function(test) {
//    test.expect(4);
//
//    var attachmentFilename,
//        datasetWithAttachmentUUID,
//        attachment = restclient.Attachment("test.csv", "text/csv", ""),
//        primitiveData =
//          restclient.PrimitiveData('text', 'testTextDescription','testValue');
//
//    submitMockData( [attachment, primitiveData]
//    ).then(
//      function(submitResponse) {
//        test.doesNotThrow( function() {
//          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
//          attachmentFilename = submitResponse.entity['response']['data'][0]['filename']
//          apiToken = submitResponse.entity['token'];
//        });
//
//        return restclient.replaceAttachment(
//          clientUUID,
//          apiToken,
//          datasetWithAttachmentUUID,
//          'notFound.csv',
//          "bmV3" // "new"
//        );
//      }
//    ).then(
//      function(replaceNotFoundResponse) {
//        test.doesNotThrow( function() {
//          test.equal(replaceNotFoundResponse.status.code, 404,
//            'replace attachment should fail with 404');
//        });
//
//        // delete mock attachments.
//        return restclient.deleteData(
//          clientUUID,
//          apiToken,
//          datasetWithAttachmentUUID
//        );
//      }
//    ).then(
//      function(deleteDataResponse) {
//        test.doesNotThrow( function() {
//          apiToken = deleteDataResponse.entity['token'];
//        });
//        test.done();
//    });
//  }
//};

exports['shareAttachment'] = {
  setUp: function(done) {
    goodLogin( function(){
      deleteAllMockData( function(callback) { done(); });
    });
  },
  'no-api-token': function(test) {
    test.expect(3);
    restclient.shareAttachment(
      null,
      null,
      null,
      null,
      null,
      new Date(),
      null,
      null
    ).then(
      function(data) {
        test.doesNotThrow( function() {
          test.equal(data.status.code, 401, 'replace attachment should fail');
          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        });
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(12);

    var attachmentFilename,
        datasetWithAttachmentUUID,
        attachment = restclient.Attachment("shared.csv",
            "text/csv",
            "b3JpZ2luYWw=" // "original"
    );

    submitMockData( [attachment]
    ).then(
      function(submitResponse) {
        test.doesNotThrow( function() {
          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
          attachmentFilename = submitResponse.entity['response']['data'][0]['filename']
          apiToken = submitResponse.entity['token'];
        });

        return restclient.shareAttachment(
          clientUUID,
          apiToken,
          datasetWithAttachmentUUID,
          attachmentFilename,
          new Date(),
          null,
          ["basicuser@example.com"]
        );
      }
    ).then(
      function(shareAttachmentResponse) {
        test.doesNotThrow( function() {
          apiToken = shareAttachmentResponse.entity['token'];
        });

        limitedLogin (
          function(limitLoginResponse) {
            test.doesNotThrow( function() {
              apiToken = limitLoginResponse.entity['token'];
            });
            restclient.listAttachments(
              clientUUID,
              apiToken
            ).then(
              function(listAttachmentResponse) {
                test.doesNotThrow( function() {
                  checkResponse(test, listAttachmentResponse.entity);
                  test.equal(listAttachmentResponse.status.code, 200, 'login should succeed');
                  test.equal(listAttachmentResponse.entity['response']['attachments'].length, 1,
                    'should return exactly 1 attachments');
                  test.equal(listAttachmentResponse.entity['response']['result_count'], 1,
                    'should return result count of exactly 1 attachments');
                  test.equal(listAttachmentResponse.entity['response']['attachments'][0]['filename'], 'shared.csv',
                    'filename should be called "shared.csv"');
                  test.equal(listAttachmentResponse.entity['response']['attachments'][0]['created_by'], 'admin@example.com',
                    'created_by should be "admin@example.com"');
                });
                test.done();
            });
        });
    });
  },
  'submitted-share-access-replaces-current': function(test) {
    test.expect(26);

    var attachmentFilename,
        datasetWithAttachmentUUID,
        attachment = restclient.Attachment("shared.csv",
            "text/csv",
            "b3JpZ2luYWw=" // "original"
    );

    submitMockData( [attachment]
    ).then(
      function(submitResponse) {
        test.doesNotThrow( function() {
          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
          attachmentFilename = submitResponse.entity['response']['data'][0]['filename']
          apiToken = submitResponse.entity['token'];
        });

        return restclient.shareAttachment(
          clientUUID,
          apiToken,
          datasetWithAttachmentUUID,
          attachmentFilename,
          new Date(),
          null,
          ["basicuser@example.com"]
        );
      }
    ).then(
      function(shareAttachmentResponse) {
        test.doesNotThrow( function() {
          apiToken = shareAttachmentResponse.entity['token'];
        });

        return limitedLogin (
          function(limitLoginResponse) {
            test.doesNotThrow( function() {
              apiToken = limitLoginResponse.entity['token'];
            });
            restclient.listAttachments(
              clientUUID,
              apiToken
            ).then(
              function(listAttachmentResponse) {
                test.doesNotThrow( function() {
                  checkResponse(test, listAttachmentResponse.entity);
                  test.equal(listAttachmentResponse.status.code, 200, 'login should succeed');
                  test.equal(listAttachmentResponse.entity['response']['attachments'].length, 1,
                    'should return exactly 1 attachments');
                  test.equal(listAttachmentResponse.entity['response']['result_count'], 1,
                    'should return result count of exactly 1 attachments');
                  test.equal(listAttachmentResponse.entity['response']['attachments'][0]['filename'], 'shared.csv',
                    'filename should be called "shared.csv"');
                  test.equal(listAttachmentResponse.entity['response']['attachments'][0]['created_by'], 'admin@example.com',
                    'created_by should be "admin@example.com"');
                });
            });
        });
      }
    ).then(
      function() {
        return goodLogin(
          function(goodLoginResponse) {
            test.doesNotThrow( function() {
              apiToken = goodLoginResponse.entity['token'];
            });

            restclient.shareAttachment(
                clientUUID,
                apiToken,
                datasetWithAttachmentUUID,
                attachmentFilename,
                new Date(),
                null,
                []
            ).then(
              function(shareAttachmentResponse) {
                test.doesNotThrow( function() {
                  checkResponse(test, shareAttachmentResponse.entity);
                  apiToken = shareAttachmentResponse.entity['token'];
                  test.equal(shareAttachmentResponse.status.code, 200, 'login should succeed');
                });
            });
        });
      }
    ).then(
      function() {
        return limitedLogin (
          function(limitLoginResponse) {
            test.doesNotThrow( function() {
              apiToken = limitLoginResponse.entity['token'];
            });

            restclient.listAttachments(
              clientUUID,
              apiToken
            ).then(
              function(listAttachmentResponse) {
                test.doesNotThrow( function() {
                  checkResponse(test, listAttachmentResponse.entity);
                  test.equal(listAttachmentResponse.status.code, 200, 'login should succeed');
                  test.equal(listAttachmentResponse.entity['response']['attachments'].length, 0,
                    'should return exactly 0 attachments');
                  test.equal(listAttachmentResponse.entity['response']['result_count'], 0,
                    'should return result count of exactly 0 attachments');
                });
                test.done();
            });
        });
    });
  },
  'sharing-filename-does-not-exist-failure': function(test) {
    test.expect(1);

    restclient.shareAttachment(
      clientUUID,
      apiToken,
      "00000000-0000-0000-0000-000000000000",
      "doesNotExist.csv",
      new Date(),
      null,
      ["basicuser@example.com"]
    ).then(
      function(shareAttachmentResponse) {
        test.doesNotThrow( function() {
          test.equal(shareAttachmentResponse.status.code, 404,
            'Sharing attachment should fail with 404 response');
          test.done();
        });
    });
  },
};

exports['shareAttachmentWithUser'] = {
  setUp: function(done) {
    goodLogin( function(){
      deleteAllMockData( function(callback) { done(); });
    });
  },
  'no-api-token': function(test) {
    test.expect(3);
    restclient.shareAttachmentWithUser(
      null,
      null,
      null,
      null,
      null
    ).then(
      function(data) {
        test.doesNotThrow( function() {
          test.equal(data.status.code, 401, 'replace attachment should fail');
          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        });
        test.done();
      });
  },
  'with-api-token': function(test) {

    var attachmentFilename,
        datasetWithAttachmentUUID,
        attachment = restclient.Attachment("shared.csv",
            "text/csv",
            "b3JpZ2luYWw=" // "original"
    );

    submitMockData( [attachment]
    ).then(
      function(submitResponse) {
        test.doesNotThrow( function() {
          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
          attachmentFilename = submitResponse.entity['response']['data'][0]['filename']
          apiToken = submitResponse.entity['token'];
        });

        return restclient.shareAttachment(
          clientUUID,
          apiToken,
          datasetWithAttachmentUUID,
          attachmentFilename,
          new Date(),
          null,
          []
        );
      }
    ).then(
      function(shareAttachmentResponse) {
        test.doesNotThrow( function() {
          apiToken = shareAttachmentResponse.entity['token'];
        });

        return restclient.shareAttachmentWithUser(
          clientUUID,
          apiToken,
          datasetWithAttachmentUUID,
          attachmentFilename,
          "basicuser@example.com"
        );
      }
    ).then(
      function(shareAttachmentResponse) {
        test.doesNotThrow( function() {
          apiToken = shareAttachmentResponse.entity['token'];
        });

        limitedLogin (
          function(limitLoginResponse) {
            test.doesNotThrow( function() {
              apiToken = limitLoginResponse.entity['token'];
            });
            restclient.listAttachments(
              clientUUID,
              apiToken
            ).then(
              function(listAttachmentResponse) {
                test.doesNotThrow( function() {
                  checkResponse(test, listAttachmentResponse.entity);
                  test.equal(listAttachmentResponse.status.code, 200, 'login should succeed');
                  test.equal(listAttachmentResponse.entity['response']['attachments'].length, 1,
                    'should return exactly 1 attachments');
                  test.equal(listAttachmentResponse.entity['response']['result_count'], 1,
                    'should return result count of exactly 1 attachments');
                  test.equal(listAttachmentResponse.entity['response']['attachments'][0]['filename'], 'shared.csv',
                    'filename should be called "shared.csv"');
                  test.equal(listAttachmentResponse.entity['response']['attachments'][0]['created_by'], 'admin@example.com',
                    'created_by should be "admin@example.com"');
                });
                test.done();
            });
        });
    });
  },
  'sharing-file-that-does-not-exist': function(test) {
    test.expect(2);

    restclient.shareAttachmentWithUser(
      clientUUID,
      apiToken,
      "00000000-0000-0000-0000-000000000000",
      "doesNotExist.csv",
      new Date(),
      null,
      "basicuser@example.com"
    ).then(
      function(shareAttachmentWithUserResponse) {
        test.doesNotThrow( function() {
          test.equal(shareAttachmentWithUserResponse.status.code, 404,
            'Sharing attachment should fail with 404 response');
          apiToken = shareAttachmentWithUserResponse.entity['token'];
        });
        test.done();
    });
  },
  'sharing-non-owned-attachment-fails': function(test) {
    test.expect(4);

    var attachmentFilename,
        datasetWithAttachmentUUID,
        attachment = restclient.Attachment("shared.csv",
            "text/csv",
            "b3JpZ2luYWw=" // "original"
    );

    submitMockData( [attachment]
    ).then(
      function(submitResponse) {
        test.doesNotThrow( function() {
          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
          attachmentFilename = submitResponse.entity['response']['data'][0]['filename']
          apiToken = submitResponse.entity['token'];
        });


        limitedLogin (
          function(limitLoginResponse) {
            test.doesNotThrow( function() {
              apiToken = limitLoginResponse.entity['token'];
            });

            restclient.shareAttachmentWithUser(
              clientUUID,
              apiToken,
              "00000000-0000-0000-0000-000000000000",
              "doesNotExist.csv",
              new Date(),
              null,
              "basicuser@example.com"
            ).then(
              function(shareAttachmentWithUserResponse) {
                test.doesNotThrow( function() {
                  test.equal(shareAttachmentWithUserResponse.status.code, 404,
                    'Sharing attachment should fail with 404 response');
                });
                test.done();
            });
        });
    });
  },
};

exports['stopSharingAttachment'] = {
  setUp: function(done) {
    goodLogin( function(){
      deleteAllMockData( function(callback) { done(); });
    });
  },
  'no-api-token': function(test) {
    test.expect(3);
    restclient.stopSharingAttachment(
      null,
      null,
      null,
      null
    ).then(
      function(data) {
        test.doesNotThrow( function() {
          test.equal(data.status.code, 401, 'replace attachment should fail');
          test.equal(data.entity, 'Access Denied: Invalid API Token', 'invalid api token text');
        });
        test.done();
      });
  },
  'with-api-token': function(test) {
    test.expect(21);

    var attachmentFilename,
        datasetWithAttachmentUUID,
        attachment = restclient.Attachment("shared.csv",
            "text/csv",
            "b3JpZ2luYWw=" // "original"
    );

    submitMockData( [attachment]
    ).then(
      function(submitResponse) {
        test.doesNotThrow( function() {
          datasetWithAttachmentUUID = submitResponse.entity['response']['uuid'];
          attachmentFilename = submitResponse.entity['response']['data'][0]['filename']
          apiToken = submitResponse.entity['token'];
        });

        return restclient.shareAttachment(
          clientUUID,
          apiToken,
          datasetWithAttachmentUUID,
          attachmentFilename,
          new Date(),
          null,
          ["basicuser@example.com" ]
        );
      }
    ).then(
      function(shareAttachmentResponse) {
        test.doesNotThrow( function() {
          apiToken = shareAttachmentResponse.entity['token'];
          test.equal(shareAttachmentResponse.status.code, 200, 'login should succeed');
        });

        return limitedLogin (
          function(limitLoginResponse) {
            test.doesNotThrow( function() {
              apiToken = limitLoginResponse.entity['token'];
            });
            restclient.listAttachments(
              clientUUID,
              apiToken
            ).then(
              function(listAttachmentResponse) {
                test.doesNotThrow( function() {
                  apiToken = listAttachmentResponse.entity['token'];
                  checkResponse(test, listAttachmentResponse.entity);
                  test.equal(listAttachmentResponse.status.code, 200, 'login should succeed');
                  test.equal(listAttachmentResponse.entity['response']['attachments'].length, 1,
                    'should return exactly 1 after attachment is shared');
                  test.equal(listAttachmentResponse.entity['response']['result_count'], 1,
                    'should return result count of exactly 1 after attachment is shared');
                });
            });
        });
      }
    ).then(
      function() {
        return goodLogin (
          function(goodLoginResponse) {
            test.doesNotThrow( function() {
              apiToken = goodLoginResponse.entity['token'];
            });

            restclient.stopSharingAttachment(
              clientUUID,
              apiToken,
              datasetWithAttachmentUUID,
              attachmentFilename
            ).then(
              function(stopSharingAttachmentResponse) {
                test.doesNotThrow( function() {
                  test.equal(stopSharingAttachmentResponse.status.code, 200, 'login should succeed');
                });
            });
        });
      }
    ).then(
      function() {
        limitedLogin (
          function(limitLoginResponse) {
            test.doesNotThrow( function() {
              apiToken = limitLoginResponse.entity['token'];
            });
            return restclient.listAttachments(
              clientUUID,
              apiToken
            ).then(
              function(listAttachmentResponse) {
                test.doesNotThrow( function() {
                  apiToken = listAttachmentResponse.entity['token'];
                  checkResponse(test, listAttachmentResponse.entity);
                  test.equal(listAttachmentResponse.status.code, 200, 'login should succeed');
                  test.equal(listAttachmentResponse.entity['response']['attachments'].length, 0,
                    'should return 0 attachments');
                  test.equal(listAttachmentResponse.entity['response']['result_count'], 0,
                    'should return result count of exactly 0 attachments');
                  test.done()
                });
            });
        });
    });
  },
  'sharing-filename-does-not-exist-failure': function(test) {
    test.expect(2);

    restclient.shareAttachment(
      clientUUID,
      apiToken,
      "00000000-0000-0000-0000-000000000000",
      "doesNotExist.csv"
    ).then(
      function(shareAttachmentResponse) {
        test.doesNotThrow( function() {
          test.equal(shareAttachmentResponse.status.code, 404,
            'Sharing attachment should fail with 404 response');
          apiToken = shareAttachmentResponse.entity['token'];
        });
        test.done();

    });
  },
};
