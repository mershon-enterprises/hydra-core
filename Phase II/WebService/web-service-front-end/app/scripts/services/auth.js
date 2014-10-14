'use strict';

angular.module('webServiceApp').factory('AuthService',
  function ($http, $rootScope, AUTH_EVENTS, Session) {

  var authService = {};

  //Authenticate against the restclient. Create a new session if the restclient
  //returns status 200, and return false otherwise.
  authService.authenticate = function (credentials) {
    restclient.authenticate(credentials.email, credentials.password,
      function(status, res){

      if (status == 200) {

        //Parse out the data from the restclient response.
        var response  = JSON.parse(res);
        var responseBody = response.response;
        var tokenExpirationDate = response.token_expiration_date;
        var token = response.token;
        var email = responseBody.email_address;
        var firstName = responseBody.first_name;
        var lastName = responseBody.last_name;
        var permissions = responseBody.access;

        //Populate the Session singleton with the user data.
        Session.create(tokenExpirationDate, token, email, firstName, lastName,
          permissions);

        //Broadcast to any listeners that login was successful.
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

      }

      else {
        //Broadcast to any listeners that login has failed.
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      }

    });

  };

  return authService;
});

//Session Singleton.
angular.module('webServiceApp').service('Session', function () {
  this.create = function (tokenExpirationDate, token, email, firstName,
    lastName, permissions) {
    this.tokenExpirationDate = tokenExpirationDate;
    this.token = token;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.permissions = permissions;
  };
  this.destroy = function () {
    this.tokenExpirationDate = null;
    this.token = null;
    this.email = null;
    this.firstName = null;
    this.lastName = null;
    this.permissions = null;
  };
  return this;
});
