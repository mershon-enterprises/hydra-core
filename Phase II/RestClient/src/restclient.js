/*
 * RestClient
 * https://github.com/Slixbits/hydra-core
 *
 * Copyright (c) 2014 Kevin Mershon
 * Licensed under the GPLv3 license.
 */

(function(exports) {

  /*jslint node: true */
  'use strict';

  var rest = require('rest');
  var Promise = require('promise');

  exports.endpointUrl = 'http://54.187.61.110:8080';

  exports.uuid = (function() {
    // borrowed from http://stackoverflow.com/a/105074/3541792
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    };
  })();

  exports.Attachment = function(filename, mimeType, contents) {
    return {
      type: 'attachment',
      filename: filename,
      mime_type: mimeType,
      contents: contents
    };
  };

  exports.PrimitiveData = function(type, description, value) {
    return {
      type: type,
      description: description,
      value: value
    };
  };

  exports.version = function() {
    rest({
      method: 'GET',
      path: exports.endpointUrl + '/version',
    });
  };

  exports.authenticate = function(emailAddress, password) {
    return new Promise( function(resolve, reject)
      rest({
        method: 'POST',
        path: exports.endpointUrl + '/authenticate',
        params: {
          email_address: emailAddress,
          password: password
        }
      }).then(
        function(response) { return resolve(response.entity); },
        function(error) { return reject(error); }
      );
    );
  };

  exports.adminAuthenticate = function(emailAddress, password, userEmailAddress,
      callback) {
    rest({
      method: 'POST',
      path: exports.endpointUrl + '/admin-authenticate',
      params: {
        email_address: emailAddress,
        password: password,
        user_email_address: userEmailAddress
      }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

  exports.listAccessLevels = function(apiToken) {
    rest({
      method: 'GET',
      path: exports.endpointUrl + '/access-levels',
      params: {
        api_token: apiToken
        }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

  exports.getAccessLevel = function(apiToken, description) {
    rest({
      method: 'GET',
      path: exports.endpointUrl + '/access-levels/' + description,
      params: {
        api_token: apiToken
      }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

  exports.listClients = function(apiToken) {
    rest({
      method: 'GET',
      path: exports.endpointUrl + '/clients',
      params: {
        api_token: apiToken
      }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

  exports.getClient = function(apiToken, name) {
    rest({
      method: 'GET',
      path: exports.endpointUrl + '/clients/' + name,
      params: {
        api_token: apiToken
      }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

  exports.listClientLocations = function(apiToken, name) {
    rest({
      method: 'GET',
      path: exports.endpointUrl + '/clients/' + name + '/locations',
      params: {
        api_token: apiToken,
      }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

  exports.listData = function(apiToken) {
    rest({
      method: 'GET',
      path: exports.endpointUrl + '/data',
      params: {
        api_token: apiToken
      }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

  exports.listDatasetsWithAttachments = function(apiToken) {
    rest({
      method: 'GET',
      path: exports.endpointUrl + '/attachments',
      params: {
        api_token: apiToken
      }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

  exports.getData = function(apiToken, uuid) {
    rest({
      method: 'GET',
      path: exports.endpointUrl + '/data/' + uuid,
      params: {
        api_token: apiToken
      }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

  // every item in data must be Attachment or PrimitiveData
  exports.submitData = function(apiToken, dateCreated, createdBy, dataItems,
      callback) {

    // guard against null date
    if (dateCreated == null)
      throw 'Date created must be specified';

    // guard against empty dataItems
    if (dataItems == undefined || !Array.isArray(dataItems) ||
        dataItems.length == 0) {
      throw 'Data items must be an array of Attachment and PrimitiveData ' +
        'and contain at least one item';
    }

    // guard against invalid contents in dataItems
    var data = [];
    for (var i=0; i < dataItems.length; i++) {
      var elem = dataItems[i];
      if ('filename' in elem && 'mime_type' in elem && 'contents' in elem) {
        data.push(exports.Attachment(elem['filename'],
          elem['mime_type'], elem['contents']));
      } else if ('type' in elem && 'description' in elem && 'value' in elem) {
        data.push(exports.PrimitiveData(elem['type'], elem['description'],
          elem['value']));
      } else {
        throw 'Invalid data item at position ' + i +
          ': must be of type Attachment or PrimitiveData';
      }
    }

    rest({
      method: 'POST',
      path: exports.endpointUrl + '/data',
      params: {
        api_token: apiToken,
        uuid: exports.uuid(),
        date_created: dateCreated.toISOString(),
        created_by: createdBy,
        data: JSON.stringify(data)
      }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

  exports.deleteData = function(apiToken, uuid) {
    rest({
      method: 'DELETE',
      path: exports.endpointUrl + '/data/' + uuid,
      params: {
        api_token: apiToken
      }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

  exports.listUsers = function(apiToken) {
    rest({
      method: 'GET',
      path: exports.endpointUrl + '/users',
      params: {
        api_token: apiToken
      }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

  exports.getUser = function(apiToken, emailAddress) {
    rest({
      method: 'GET',
      path: exports.endpointUrl + '/users/' + emailAddress,
      params: {
        api_token: apiToken
      }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

  exports.listUserAccess = function(apiToken, emailAddress) {
    rest({
      method: 'GET',
      path: exports.endpointUrl + '/users/' + emailAddress + '/access',
      params: {
        api_token: apiToken
      }
    }).then(
      function(response) { return response.entity; },
      function(error) { return error; }
    );
  };

}(typeof exports === 'object' && exports || this));
