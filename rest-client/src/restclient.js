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

  // replaced by grunt-string-replace
  exports.endpointUrl = 'ENDPOINT_URL';

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
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/version',
    });
  };

  exports.authenticate = function(clientUUID, emailAddress, password) {
    return rest({
      method: 'POST',
      path: exports.endpointUrl + '/authenticate',
      params: {
        client_uuid: clientUUID,
        email_address: emailAddress,
        password: password
      }
    });
  };

  exports.adminAuthenticate = function(clientUUID, emailAddress, password, userEmailAddress) {
    return rest({
      method: 'POST',
      path: exports.endpointUrl + '/admin-authenticate',
      params: {
        client_uuid: clientUUID,
        email_address: emailAddress,
        password: password,
        user_email_address: userEmailAddress
      }
    });
  };

  exports.listAccessLevels = function(clientUUID, apiToken) {
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/access-levels',
      params: {
        client_uuid: clientUUID,
        api_token: apiToken
      }
    });
  };

  exports.getAccessLevel = function(clientUUID, apiToken, description) {
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/access-levels/' + description,
      params: {
        client_uuid: clientUUID,
        api_token: apiToken
      }
    });
  };

  exports.listClients = function(clientUUID, apiToken) {
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/clients',
      params: {
        client_uuid: clientUUID,
        api_token: apiToken
      }
    });
  };

  exports.getClient = function(clientUUID, apiToken, name) {
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/clients/' + name,
      params: {
        client_uuid: clientUUID,
        api_token: apiToken
      }
    });
  };

  exports.listClientLocations = function(clientUUID, apiToken, name) {
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/clients/' + name + '/locations',
      params: {
        client_uuid: clientUUID,
        api_token: apiToken,
      }
    });
  };

  exports.listData = function(clientUUID, apiToken, searchParams) {
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/data',
      params: {
        client_uuid: clientUUID,
        api_token: apiToken,
        search_params: searchParams
      }
    });
  };

  exports.getData = function(clientUUID, apiToken, uuid) {
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/data/' + uuid,
      params: {
        client_uuid: clientUUID,
        api_token: apiToken
      }
    });
  };

  // every item in data must be Attachment or PrimitiveData
  exports.submitData = function(clientUUID, apiToken, dateCreated, createdBy, dataItems) {

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

    return rest({
      method: 'POST',
      path: exports.endpointUrl + '/data',
      params: {
        client_uuid: clientUUID,
        api_token: apiToken,
        uuid: exports.uuid(),
        date_created: dateCreated.toISOString(),
        created_by: createdBy,
        data: JSON.stringify(data)
      }
    });
  };

  exports.deleteData = function(clientUUID, apiToken, uuid) {
    return rest({
      method: 'DELETE',
      path: exports.endpointUrl + '/data/' + uuid,
      params: {
        client_uuid: clientUUID,
        api_token: apiToken
      }
    });
  };

  exports.listAttachments = function(clientUUID, apiToken, searchParams) {
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/attachments',
      params: {
        client_uuid: clientUUID,
        api_token: apiToken,
        search_params: JSON.stringify(searchParams)
      }
    });
  };

  exports.getAttachment = function(clientUUID, apiToken, uuid, filename) {
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/data/' + uuid + "/" + filename,
      params: {
        client_uuid: clientUUID,
        api_token: apiToken
      }
    });
  };

  exports.getAttachmentURL = function(clientUUID, apiToken, uuid, filename) {
    return exports.endpointUrl + '/data/' + uuid + '/' + filename + '?client_uuid='+clientUUID + '&api_token='+apiToken;
  };

  exports.getAttachmentInfo = function(clientUUID, apiToken, uuid, filename) {
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/data/' + uuid + "/" + filename + "/info",
      params: {
        client_uuid: clientUUID,
        api_token: apiToken
      }
    });
  };

  exports.renameAttachment = function(clientUUID, apiToken, uuid, filename, newFilename) {
    return rest({
      method: 'PUT',
      path: exports.endpointUrl + '/data/' + uuid + "/" + filename,
      params: {
        client_uuid: clientUUID,
        api_token: apiToken,
        new_filename: newFilename
      }
    });
  };

  exports.deleteAttachment = function(clientUUID, apiToken, uuid, filename) {
    return rest({
      method: 'DELETE',
      path: exports.endpointUrl + '/data/' + uuid + "/" + filename,
      params: {
        client_uuid: clientUUID,
        api_token: apiToken
      }
    });
  };

  exports.submitTag = function(clientUUID, apiToken, uuid, type, description, value) {
    return rest({
      method: 'POST',
      path: exports.endpointUrl + '/data/' + uuid + "/submit-tag",
      params: {
        client_uuid: clientUUID,
        api_token: apiToken,
        type: type,
        description: description,
        value: value
      }
    });
  };

  exports.deleteTag = function(clientUUID, apiToken, uuid, type, description) {
    return rest({
      method: 'DELETE',
      path: exports.endpointUrl + '/data/' + uuid + "/delete-tag",
      params: {
        client_uuid: clientUUID,
        api_token: apiToken,
        type: type,
        description: description
      }
    });
  };



  exports.listUsers = function(clientUUID, apiToken) {
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/users',
      params: {
        client_uuid: clientUUID,
        api_token: apiToken
      }
    });
  };

  exports.getUser = function(clientUUID, apiToken, emailAddress) {
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/users/' + emailAddress,
      params: {
        client_uuid: clientUUID,
        api_token: apiToken
      }
    });
  };

  exports.listUserAccess = function(clientUUID, apiToken, emailAddress) {
    return rest({
      method: 'GET',
      path: exports.endpointUrl + '/users/' + emailAddress + '/access',
      params: {
        client_uuid: clientUUID,
        api_token: apiToken
      }
    });
  };

}(typeof exports === 'object' && exports || this));