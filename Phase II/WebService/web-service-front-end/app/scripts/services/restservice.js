'use strict';

angular.module('webServiceApp').factory('RestService',
    function ($rootScope, EVENTS, STATUS_CODES, Session) {

  var restService = {};

  restService.authenticate = function (credentials) {
    restclient.authenticate(credentials.email, credentials.password,
      function(status, res){

      if (status == STATUS_CODES.ok) {

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
        $rootScope.$broadcast(EVENTS.loginSuccess);

      }

      else {
        //Broadcast to any listeners that login has failed.
        $rootScope.$broadcast(EVENTS.loginFailed);
      }

    });
  };

  restService.listAccessLevels = function () {
    restclient.listAccessLevels(Session.token, function(status, res) {
        if (status == STATUS_CODES.ok) {
          var response = JSON.parse(res);
          console.log(response);
        }
        else {
          console.log(status);
        }
    });
  }

  return restService;
});
