'use strict';

angular.module('webServiceApp').factory('RestService',
    function ($rootScope, $q, EVENTS, STATUS_CODES, Session, NotificationService, localStorageService) {

    var restService = {};

    restService.authenticate = function (credentials) {
        restclient.authenticate(credentials.email, credentials.password).then(
            function(data) {

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

                    //Create the cache for this user's data.
                    restService.createCache();

                    }
                else {
                    //Broadcast to any listeners that login has failed.
                    $rootScope.$broadcast(EVENTS.loginFailed);
                }
            },
            function(error) {console.log('Promise failed. ' + error);}
        );
    };

    restService.listAccessLevels = function () {

        restclient.listAccessLevels(Session.getToken()).then(

            function(data) {

                //Parse out the data from the restclient response.
                var response = JSON.parse(data.entity);
                Session.updateToken(response.token);

                if (data.status.code === STATUS_CODES.ok) {

                    var responseBody = response.response;

                    restService.updateCacheValue('accessLevels', responseBody);

                }
                else {
                  //Broadcast to any listeners that data wasn't retrieved.
                  $rootScope.$broadcast(EVENTS.dataLost);
                }
            },
            function(error) {
                console.log('Promise failed. ' + error);
            }
        );
    };

    restService.listClients = function () {

        restclient.listClients(Session.getToken()).then(

            function(data) {

                //Parse out the data from the restclient response.
                var response = JSON.parse(data.entity);
                Session.updateToken(response.token);

                if (data.status.code === STATUS_CODES.ok) {

                    var responseBody = response.response;

                    restService.updateCacheValue('clients', responseBody);

                }
                else {
                  //Broadcast to any listeners that data wasn't retrieved.
                  $rootScope.$broadcast(EVENTS.dataLost);
                }
            },
            function(error) {
                console.log('Promise failed. ' + error);
            }
        );
    };

    restService.listUsers = function () {

        restclient.listUsers(Session.getToken()).then(

            function(data) {

                //Parse out the data from the restclient response.
                var response = JSON.parse(data.entity);
                Session.updateToken(response.token);

                if (data.status.code === STATUS_CODES.ok) {

                    var responseBody = response.response;

                    restService.updateCacheValue('users', responseBody);

                }
                else {
                  //Broadcast to any listeners that data wasn't retrieved.
                  $rootScope.$broadcast(EVENTS.dataLost);
                }
            },
            function(error) {
                console.log('Promise failed. ' + error);
            }
        );
    };

    restService.listData = function () {

        restclient.listData(Session.getToken()).then(

            function(data) {

                //Parse out the data from the restclient response.
                var response = JSON.parse(data.entity);
                Session.updateToken(response.token);

                if (data.status.code === STATUS_CODES.ok) {

                    var responseBody = response.response;

                    var parsedData =  restService.parseData(responseBody);

                    restService.updateCacheValue('data', parsedData);

                }
                else {
                  //Broadcast to any listeners that data wasn't retrieved.
                  $rootScope.$broadcast(EVENTS.dataLost);
                }
            },
            function(error) {
                console.log('Promise failed. ' + error);
            }
        );
    };

    restService.listDatasetsWithAttachments = function () {

        restclient.listDatasetsWithAttachments(Session.getToken()).then(

            function(data) {

                //Parse out the data from the restclient response.
                var response = JSON.parse(data.entity);
                Session.updateToken(response.token);

                if (data.status.code === STATUS_CODES.ok) {

                    var responseBody = response.response;

                    restService.updateCacheValue('data', responseBody);

                }
                else {
                  //Broadcast to any listeners that data wasn't retrieved.
                  $rootScope.$broadcast(EVENTS.dataLost);
                }
            },
            function(error) {
                console.log('Promise failed. ' + error);
            }
        );
    };

    //Parse the data from the restClient into a format ngTable wants.
    //[{key1:value1, key2:value2, ...}, {key1:value1, key2:value2, ...}, ...]
    restService.parseData = function (rawData) {

        var data = [];
        var attachments = [];
        var createdBy = null;
        var dateCreated = null;
        var clientName = null;
        var fieldName = null;
        var wellName = null;
        var trailerNumber = null;

        $.each(rawData, function(index, value){
            createdBy = {created_by: value.created_by};
            dateCreated = {date_created: value.date_created};
            $.each(value.data, function(index, value){
                if(value.type === 'attachment') {
                    attachments.push(value);
                }
                else if(value.type === 'text') {
                    if(value.description === 'clientName') {
                        clientName = {client_name: value.value};
                    }
                    else if(value.description === 'fieldName') {
                        fieldName = {field_name: value.value};
                    }
                    else if(value.description === 'wellName') {
                        wellName = {well_name: value.value};
                    }
                    else if(value.description === 'trailerNumber') {
                        trailerNumber = {trailer_number: value.value};
                    }
                }
            });
            $.each(attachments, function(index, value){
                data.push($.extend(value, createdBy, dateCreated,
                    clientName, fieldName, wellName, trailerNumber));
            });
            attachments = [];
        });

        return data;
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

    //CACHE ====================================================================
    restService.createCache = function () {
        localStorageService.set('accessLevels', null);
        localStorageService.set('clients', null);
        localStorageService.set('users', null);
        localStorageService.set('data', null);
        restService.refreshCache();
    };

    restService.refreshCache = function () {

        var defer = $q.defer();

        NotificationService.info('Downloading Data', 'Please wait...')
        defer.promise.then(function () {
            restService.listAccessLevels();
        })
        .then(function () {
            restService.listClients();
        })
        .then(function () {
            restService.listUsers();
        })
        .then(function () {
            restService.listData();
        });

        defer.resolve();

        restService.saveToLocalStorage();

    };

    restService.updateCacheValue = function (key, data) {
        if ( key === 'accessLevels') {
            localStorageService.set('accessLevels', data);
        }
        else if ( key === 'clients') {
            localStorageService.set('clients', data);
        }
        else if ( key === 'users') {
            localStorageService.set('users', data);
        }
        else if ( key === 'data') {
            localStorageService.set('data', data);
        }
    };

    restService.getCacheValue = function (key) {
        if ( key === 'accessLevels') {
            return localStorageService.get('accessLevels');
        }
        else if ( key === 'clients') {
            return localStorageService.get('clients');
        }
        else if ( key === 'users') {
            return localStorageService.get('users');
        }
        else if ( key === 'data') {
            return localStorageService.get('data');
        }
    };

    restService.cacheExists = function () {
        if(localStorageService.get('data')) {
            return true;
        }
        else {
            restService.refreshCache();
            if(localStorageService.get('data')) {
                return true;
            }
        }
        console.log('Could not restore cache.');
        return false;
    };

    restService.destroyCache = function () {
        localStorageService.set('accessLevels', null);
        localStorageService.set('clients', null);
        localStorageService.set('users', null);
        localStorageService.set('data', null);
        localStorageService.remove('accessLevels');
        localStorageService.remove('clients');
        localStorageService.remove('users');
        localStorageService.remove('data');
    };

  return restService;
});
