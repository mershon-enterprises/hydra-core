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

}(typeof exports === 'object' && exports || this));
