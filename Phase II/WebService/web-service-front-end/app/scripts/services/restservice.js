'use strict';

//RestService Factory

//Acts as an angular wrapper for Restclient calls.
angular.module('webServiceApp').factory('RestService',
    function ($rootScope, $q, EVENTS, STATUS_CODES, Session, NotificationService, localStorageService) {

    var restService = {};

    //Both calls Restclient.authenticate and creates the user's session upon
    //successful login.
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

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');

        restclient.listAccessLevels(clientUUID, Session.getToken()).then(

            function(data) {

                deferred.resolve();
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
                deferred.reject();
                console.log('Promise failed. ' + error);
            });

        return deferred.promise;
    };

    restService.listClients = function () {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');

        restclient.listClients(clientUUID, Session.getToken()).then(

            function(data) {

                deferred.resolve();
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
                deferred.reject();
                console.log('Promise failed. ' + error);
            });

        return deferred.promise;
    };

    restService.listUsers = function () {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');

        restclient.listUsers(clientUUID, Session.getToken()).then(

            function(data) {

                deferred.resolve();
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
                deferred.reject();
                console.log('Promise failed. ' + error);
            });

        return deferred.promise;
    };

    restService.listData = function () {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');

        restclient.listData(clientUUID, Session.getToken()).then(

            function(data) {

                deferred.resolve();
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
                deferred.reject();
                console.log('Promise failed. ' + error);
            });
        return deferred.promise;
    };

    restService.listDatasetsWithAttachments = function () {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');

        restclient.listDatasetsWithAttachments(clientUUID, Session.getToken()).then(

            function(data) {

                deferred.resolve();
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
                deferred.reject();
                console.log('Promise failed. ' + error);
            });
        return deferred.promise;
    };

    //Parse the data from the restClient into a format ngGrid wants.
    //[{key1:value1, key2:value2, ...}, {key1:value1, key2:value2, ...}, ...]
    restService.parseData = function (rawData) {

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
        var uniqueKey = null;

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
                uniqueKey = {unique_key: value.filename + '\n' + uuid.uuid};
                data.push($.extend(value, uuid, createdBy, location, dateCreated,
                    clientName, fieldName, wellName, trailerNumber, uniqueKey));
            });
            attachments = [];
        });

        return data;
    };

    //TODO - Broken.
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

    //Delete an attachment on the server.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.deleteAttachment = function (ukey) {

        var clientUUID = localStorageService.get('clientUUID');
        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        restclient.deleteAttachment(clientUUID, Session.getToken(), uuid, filename).then(

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

    //Rename an attachment on the server.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.renameAttachment = function (ukey, newFilename) {

        var clientUUID = localStorageService.get('clientUUID');
        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        restclient.renameAttachment(clientUUID, Session.getToken(), uuid, filename, newFilename).then(

            function(data) {

                //Parse out the data from the restclient response.
                var response = JSON.parse(data.entity);
                Session.updateToken(response.token);

                if (data.status.code === STATUS_CODES.ok) {
                    console.log(filename + ' renamed to ' + newFilename);
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

//CACHE ========================================================================

    //Create the cache keys in localstorage.
    restService.createCache = function () {
        localStorageService.set('accessLevels', null);
        localStorageService.set('clients', null);
        localStorageService.set('users', null);
        localStorageService.set('data', null);
    };

    //Invoke all restservice methods to repopulate the cache with new values
    //from the restAPI. Returns a promise.
    restService.refreshCache = function () {
        //A promise that resolves if all promises objects in the
        //array resolve with success. Rejects with the error of the first
        //promise to reject.
        return $q.all([
            restService.listAccessLevels(),
            restService.listClients(),
            restService.listUsers(),
            restService.listDatasetsWithAttachments()
        ]);
    };

    //Updates a cache value in localstorage with a given key.
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

    //Returns a cache value from localstorage with a given key.
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
        }
        else if (key === 'clientUUID') {
            return localStorageService.get('clientUUID');
        }
    };

    //Remove a value from the restclient's data cache with a matching filename
    //and uuid.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.removeCacheDataValue = function (ukey) {

        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        var data = localStorageService.get('data');
        var matchingIndex = null;

        if(data) {
            $.each(data, function(index, value){
                if((value.uuid === uuid) && (value.filename === filename)) {
                    matchingIndex = index;
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

    //Rename a value from the restclient's data cache with a matching filename
    //and uuid.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.renameCacheDataValue = function (ukey, newFilename) {

        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        var data = localStorageService.get('data');
        var matchingIndex = null;

        if(data) {
            $.each(data, function(index, value){
                if((value.uuid === uuid) && (value.filename === filename)) {
                    matchingIndex = index;
                }
            });

            if(matchingIndex) {
                data[matchingIndex].filename = newFilename;
                restService.updateCacheValue('data', data);
                return true;
            }
        }
        return false;
    };

    //Check if data is available in the cache. Refresh it if not.
    restService.cacheExists = function () {

        var deferred = $q.defer();

        //If you have a session...
        if (Session.exists()) {
            //And there is already data in the cache...
            if(localStorageService.get('data')) {
                //Data controller may tell the table to update.
                deferred.resolve(true);
            }
            //Otherwise, refresh the cache...
            else {
                restService.refreshCache().then(
                    function(success) {
                        //Data controller may tell the table to update.
                        deferred.resolve(true);
                    },
                    function(error) {
                        //Data controller may not tell the table to update.
                        deferred.reject(false);
                    }
                );
            }
        }
        return deferred.promise;
    };

    //Destroy the cache values and their keys from local storage.
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
