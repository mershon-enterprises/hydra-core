'use strict';

angular.module('webServiceApp').factory('RestService',
    function ($rootScope, EVENTS, STATUS_CODES, Session, NotificationService) {

  var restService = {};

  restService.authenticate = function (credentials) {
      restclient.authenticate(credentials.email, credentials.password).then(
        function(data) {

          console.log(data);

          if (data.status.code === STATUS_CODES.ok) {
            //Parse out the data from the restclient response.
            var response = JSON.parse(data.entity);
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
        },
        function(error) {console.log("Promise failed.");}
      );
  };

  restService.createCache = function () {
    this.cache = {
      accessLevels: null,
      clients: null,
      users: null,
      data: null
    };

    this.cache.data = this.listData();

  };

  restService.updateCache = function () {

    this.cache.data = this.listData();

  };

  restService.listAccessLevels = function () {

    restclient.listAccessLevels(Session.getToken(), function(status, res) {

        var response = JSON.parse(res);
        Session.updateToken(response.token);

        if (status === STATUS_CODES.ok) {
          $rootScope.$broadcast(EVENTS.accessLevelsRetrieved);
          return response.response;
        }
        else {
          console.log('restclient.listAccessLevels failed with ' + status);
          $rootScope.$broadcast(EVENTS.dataLost);
          return null;
        }
    });
  };

  restService.listClients = function () {

    restclient.listClients(Session.getToken(), function(status, res) {

      var response = JSON.parse(res);
      Session.updateToken(response.token);

        if (status === STATUS_CODES.ok) {
          $rootScope.$broadcast(EVENTS.clientsRetrieved);
          return response.response;
        }
        else {
          console.log('restclient.listClients failed with ' + status);
          $rootScope.$broadcast(EVENTS.dataLost);
          return null;
        }
    });
  };

  restService.listUsers = function () {

    restclient.listUsers(Session.getToken(), function(status, res) {

      var response = JSON.parse(res);
      Session.updateToken(response.token);

        if (status === STATUS_CODES.ok) {
          $rootScope.$broadcast(EVENTS.usersRetrieved);
          return response.response;
        }
        else {
          console.log('restclient.listUsers failed with ' + status);
          $rootScope.$broadcast(EVENTS.dataLost);
          return null;
        }
    });
  };

  restService.listData = function () {

    restclient.listData(Session.getToken(), function(status, res) {

      var response = JSON.parse(res);
      Session.updateToken(response.token);

        if (status === STATUS_CODES.ok) {
          $rootScope.$broadcast(EVENTS.dataRetrieved);
          return response.response;
        }
        else {
          console.log('restclient.listData failed with ' + status);
          $rootScope.$broadcast(EVENTS.dataLost);
          return null;
        }
    });
  };

  restService.listDatasetsWithAttachments = function () {

    restclient.listDatasetsWithAttachments(Session.getToken(), function(status, res) {

        var response = JSON.parse(res);
        Session.updateToken(response.token);

        if (status === STATUS_CODES.ok) {
          $rootScope.$broadcast(EVENTS.dataRetrieved);
          return response.response;
        }
        else {
          console.log('restclient.listDatasetsWithAttachments failed with ' + status);
          $rootScope.$broadcast(EVENTS.dataLost);
          return null;
        }
    });
  };

  restService.submitData = function (dateCreated, createdByEmailAddress, dataItems) {

    restclient.submitData(Session.getToken(), dateCreated, createdByEmailAddress, dataItems, function(status, res) {

        var response = JSON.parse(res);
        Session.updateToken(response.token);

        if (status === STATUS_CODES.ok) {
          NotificationService.success('Dataset Submitted', 'Updating cache...');
        }
        else {
          NotificationService.error('Dataset Submission Failed', 'Please try again.');
          console.log('restclient.submitData failed with ' + status);
        }
    });
  };

  //Listener for a failed data retrieval.
  $rootScope.$on(EVENTS.dataLost, function() {
      NotificationService.error('No Data', 'Please try again.');
  });

  return restService;
});
