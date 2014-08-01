/*
 * RestClient
 * https://github.com/Slixbits/hydra-core
 *
 * Copyright (c) 2014 Kevin Mershon
 * Licensed under the GPLv3 license.
 */

(function(exports) {

  'use strict';

  var rest = require('rest');

  var endpointUrl = 'http://54.187.61.110:8080';

  exports.login = function(emailAddress, password, callback) {
    rest({
      method: 'POST',
      path: endpointUrl + '/login',
      params: {
        email_address: emailAddress,
        password: password
      }
    }).then(function(response) {
      callback(response.status.code, response.entity);
    });
  };

  exports.logout = function(callback) {
    rest({
      method: 'POST',
      path: endpointUrl + '/logout',
    }).then(function(response) {
      callback(response.status.code, response.entity);
    });
  };

}(typeof exports === 'object' && exports || this));
