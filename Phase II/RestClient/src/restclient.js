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

  var endpointUrl = 'http://54.187.61.110:8080';

  exports.version = function(callback) {
    rest({
      method: 'GET',
      path: endpointUrl + '/version',
    }).then(function(response) {
      callback(response.status.code, response.entity);
    });
  };

  exports.authenticate = function(emailAddress, password, callback) {
    rest({
      method: 'POST',
      path: endpointUrl + '/authenticate',
      params: {
        email_address: emailAddress,
        password: password
      }
    }).then(function(response) {
      callback(response.status.code, response.entity);
    });
  };

  exports.listAccessLevels = function(apiToken, callback) {
    rest({
      method: 'GET',
      path: endpointUrl + '/access-levels',
      params: {
        api_token: apiToken
      }
    }).then(function(response) {
      callback(response.status.code, response.entity);
    });
  };

  exports.getAccessLevel = function(apiToken, description, callback) {
    rest({
      method: 'GET',
      path: endpointUrl + '/access-levels/' + description,
      params: {
        api_token: apiToken
      }
    }).then(function(response) {
      callback(response.status.code, response.entity);
    });
  };

  exports.listClients = function(apiToken, callback) {
    rest({
      method: 'GET',
      path: endpointUrl + '/clients',
      params: {
        api_token: apiToken
      }
    }).then(function(response) {
      callback(response.status.code, response.entity);
    });
  };

  exports.getClient = function(apiToken, name, callback) {
    rest({
      method: 'GET',
      path: endpointUrl + '/clients/' + name,
      params: {
        api_token: apiToken
      }
    }).then(function(response) {
      callback(response.status.code, response.entity);
    });
  };

  exports.listClientLocations = function(apiToken, name, callback) {
    rest({
      method: 'GET',
      path: endpointUrl + '/clients/' + name + '/locations',
      params: {
        api_token: apiToken,
      }
    }).then(function(response) {
      callback(response.status.code, response.entity);
    });
  };

}(typeof exports === 'object' && exports || this));
