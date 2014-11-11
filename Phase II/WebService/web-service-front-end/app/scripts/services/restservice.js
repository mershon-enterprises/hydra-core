'use strict';

angular.module('webServiceApp').factory('RestService',
    function ($rootScope, $q, EVENTS, STATUS_CODES, Session, NotificationService, localStorageService) {

    var restService = {};

    $rootScope.loading = false;

    restService.authenticate = function (credentials) {
        var clientUUID = localStorageService.get('clientUUID');
        restclient.authenticate(clientUUID, credentials.email, credentials.password).then(
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

                    //Create the cache for this user's data.
                    restService.createCache();

                    //Broadcast to any listeners that login was successful.
                    $rootScope.$broadcast(EVENTS.loginSuccess);
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
        var clientUUID = localStorageService.get('clientUUID');

        restclient.listAccessLevels(clientUUID, Session.getToken()).then(

            function(data) {

                if (data.status.code === STATUS_CODES.ok) {
                    //Parse out the data from the restclient response.
                    var response = JSON.parse(data.entity);
                    Session.updateToken(response.token);

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
        var clientUUID = localStorageService.get('clientUUID');

        restclient.listClients(clientUUID, Session.getToken()).then(

            function(data) {
                if (data.status.code === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var response = JSON.parse(data.entity);
                    Session.updateToken(response.token);

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
        var clientUUID = localStorageService.get('clientUUID');

        restclient.listUsers(clientUUID, Session.getToken()).then(

            function(data) {
                if (data.status.code === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var response = JSON.parse(data.entity);
                    Session.updateToken(response.token);

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
        var clientUUID = localStorageService.get('clientUUID');

        restclient.listData(clientUUID, Session.getToken()).then(

            function(data) {
                if (data.status.code === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var response = JSON.parse(data.entity);
                    Session.updateToken(response.token);

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
        var clientUUID = localStorageService.get('clientUUID');

        restclient.listDatasetsWithAttachments(clientUUID, Session.getToken()).then(

            function(data) {
                if (data.status.code === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var response = JSON.parse(data.entity);
                    Session.updateToken(response.token);

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

    //Parse the data from the restClient into a format ngTable wants.
    //[{key1:value1, key2:value2, ...}, {key1:value1, key2:value2, ...}, ...]
    restService.parseData = function (rawData) {

        console.log(rawData);

        var data = [];
        var attachments = [];
        var uuid = null;
        var createdBy = null;
        var dateCreated = null;
        var clientName = null;
        var location = null;
        var fieldName = null;
        var wellName = null;
        var trailerNumber = null;

        $.each(rawData, function(index, value){
            createdBy = {created_by: value.created_by};
            uuid = {uuid: value.uuid};
            dateCreated = {date_created: value.date_created};
            clientName = {client: value.client};
            location = {location: value.location};
            $.each(value.attachments, function(index, value){
                if(value.type === 'attachment') {
                    attachments.push(value);
                }
            });
            $.each(value.primitive_text_data, function(index, value){
                if(value.type === 'text') {
                    if(value.description === 'fieldName') {
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
                data.push($.extend(value, uuid, createdBy, location, dateCreated,
                    clientName, fieldName, wellName, trailerNumber));
            });
            attachments = [];
        });

        console.log(data);

        return data;
    };

  restService.submitData = function (dateCreated, createdByEmailAddress, dataItems) {
    var clientUUID = localStorageService.get('clientUUID');

    restclient.submitData(clientUUID, Session.getToken(), dateCreated, createdByEmailAddress, dataItems, function(status, res) {
        if (status === STATUS_CODES.ok) {
          var response = JSON.parse(res);
          Session.updateToken(response.token);

          NotificationService.success('Dataset Submitted', 'Updating cache...');
        }
        else {
          NotificationService.error('Dataset Submission Failed', 'Please try again.');
          console.log('restclient.submitData failed with ' + status);
        }
    });
  };

  restService.deleteAttachment = function (uuid, filename) {

        restclient.deleteAttachment(Session.getToken(), uuid, filename).then(

            function(data) {

                //Parse out the data from the restclient response.
                var response = JSON.parse(data.entity);
                Session.updateToken(response.token);

                if (data.status.code === STATUS_CODES.ok) {
                    console.log(filename + ' deleted.');
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
    };

    restService.refreshCache = function () {

        var defer = $q.defer();

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
            restService.listDatasetsWithAttachments();
        });

        defer.resolve();

    };

    restService.updateCacheValue = function (key, data) {
        if (key === 'accessLevels') {
            localStorageService.set('accessLevels', data);
        }
        else if (key === 'clients') {
            localStorageService.set('clients', data);
        }
        else if (key === 'users') {
            localStorageService.set('users', data);
        }
        else if (key === 'data') {
            localStorageService.set('data', data);
        }
    };

    restService.getCacheValue = function (key) {
        if (key === 'accessLevels') {
            return localStorageService.get('accessLevels');
        }
        else if (key === 'clients') {
            return localStorageService.get('clients');
        }
        else if (key === 'users') {
            return localStorageService.get('users');
        }
        else if (key === 'data') {
            return localStorageService.get('data');
        } else if (key === 'clientUUID') {
            return localStorageService.get('clientUUID');
        }
    };

    //Remove a value from the restclient's data cache.
    restService.removeCacheDataValue = function (uuid) {

        var data = localStorageService.get('data');
        var matchingIndex = null;

        if(data) {
            $.each(data, function(index, value){
                if(value.uuid === uuid) {
                    matchingIndex = value;
                }
            });

            if(matchingIndex) {
                data.splice(matchingIndex, 1);
                restService.updateCacheValue('data', data);
                return true;
            }
        }
        return false;
    };

    //Retrieve a filename from a given UUID.
    restService.getFilename = function (uuid) {

        var data = localStorageService.get('data');

        if(data) {
            $.each(data, function(index, value){
                if(value.uuid === uuid) {
                    return value.filename;
                }
            });
        }
        return null;
    };

    //Returns true if the cache can be accessed from local storage. False
    //otherwise.
    restService.cacheExists = function () {
        if (Session.exists()) {
            if(localStorageService.get('data')) {
                $rootScope.loading = false;
                return true;
            }
            if (!$rootScope.loading) {
                $rootScope.loading = true;
                restService.refreshCache();
            }
            return false;
        }
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
        $rootScope.loading = false;
    };

  return restService;
});
