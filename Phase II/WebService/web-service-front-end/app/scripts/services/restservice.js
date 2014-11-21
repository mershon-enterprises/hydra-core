'use strict';

//RestService Factory

//Acts as an angular wrapper for Restclient calls
angular.module('webServiceApp').factory('RestService',
    function ($rootScope, $q, EVENTS, STATUS_CODES, Session, localStorageService) {

    var restService = {};

    restService.updateClientUUID = function () {
        //Generate a unique ID for this client if one doesn't exist
        if(!localStorageService.get('clientUUID')) {
            localStorageService.set('clientUUID', restclient.uuid());
        }
    };

    //Authenticates user, creates their session and creates the cache.
    restService.authenticate = function (credentials) {

        //Create promise wrapper
        var deferred = $q.defer();

        //Generate client UUID if it does not exist
        restService.updateClientUUID();

        //Grab that UUID
        var clientUUID = localStorageService.get('clientUUID');

        restclient.authenticate(clientUUID, credentials.email,
        credentials.password).then(
            function(response) {

                if (response.status.code === STATUS_CODES.ok) {
                    //Parse out the data we want.
                    var jsonResponse = JSON.parse(response.entity);

                    var responseBody = jsonResponse.response;
                    var token = jsonResponse.token;

                    var tokenExpirationDate = response.token_expiration_date;
                    var email = responseBody.email_address;
                    var firstName = responseBody.first_name;
                    var lastName = responseBody.last_name;
                    var permissions = responseBody.access;

                    //Populate the Session singleton with the user data
                    Session.create(tokenExpirationDate, token, email, firstName,
                    lastName, permissions);

                    //Create the cache for this user's data
                    restService.createCache();

                    $rootScope.$apply(function() {
                        //Broadcast to any listeners that the cache should be
                        //refreshed
                        $rootScope.$broadcast(EVENTS.cacheRefresh);
                    });

                    //Mark that we have received data
                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log('restclient.authenticate succeeded');
                    console.log('Session created for ' + firstName + ' ' +
                        lastName);
                }
                else {
                    //If we did get data, but a bad status code, then the
                    //promise wrapped needs to handle the event like a rejection
                    deferred.reject([EVENTS.badStatus, response.status.code]);
                    console.log('restclient.authenticate promise succeeded. ' +
                        'But with bad status code : ' + response.status.code);
                }
            },
            function(error) {
                //Mark that we have not received data and log.
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.authenticate promise failed: ' + error);
            }
        );

        //Return promise wrapper.
        return deferred.promise;

    };

    restService.listAccessLevels = function () {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');

        restclient.listAccessLevels(clientUUID, Session.getToken()).then(

            function(response) {

                if (response.status.code === STATUS_CODES.ok) {
                    //Parse out the data from the restclient response.
                    var jsonResponse = JSON.parse(response.entity);
                    Session.updateToken(jsonResponse.token);

                    var responseBody = jsonResponse.response;

                    restService.updateCacheValue('accessLevels', responseBody);

                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log('restclient.listAccessLevels succeeded');
                }
                else {
                    //If we did get data, but a bad status code, then the
                    //promise wrapped needs to handle the event like a rejection
                    deferred.reject([EVENTS.badStatus, response.status.code]);
                    console.log('restclient.listAccessLevels promise succeeded ' + 'But with bad status code : ' + response.status.code);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.listAccessLevels promise failed: ' + error);
            });

        return deferred.promise;
    };

    restService.listClients = function () {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');

        restclient.listClients(clientUUID, Session.getToken()).then(

            function(response) {

                if (response.status.code === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var jsonResponse = JSON.parse(response.entity);
                    Session.updateToken(jsonResponse.token);

                    var responseBody = jsonResponse.response;

                    restService.updateCacheValue('clients', responseBody);

                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log('restclient.listClients succeeded');
                }
                else {
                    //If we did get data, but a bad status code, then the
                    //promise wrapped needs to handle the event like a rejection
                    deferred.reject([EVENTS.badStatus, response.status.code]);
                    console.log('restclient.listClients promise succeeded ' +
                        'But with bad status code : ' + response.status.code);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.listClients promise failed: ' + error);
            });

        return deferred.promise;
    };

    restService.listUsers = function () {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');

        restclient.listUsers(clientUUID, Session.getToken()).then(

            function(response) {

                if (response.status.code === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var jsonResponse = JSON.parse(response.entity);
                    Session.updateToken(jsonResponse.token);

                    var responseBody = jsonResponse.response;

                    restService.updateCacheValue('users', responseBody);

                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log('restclient.listUsers succeeded');
                }
                else {
                    //If we did get data, but a bad status code, then the
                    //promise wrapped needs to handle the event like a rejection
                    deferred.reject([EVENTS.badStatus, response.status.code]);
                    console.log('restclient.listUsers promise succeeded ' +
                        'But with bad status code : ' + response.status.code);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.listUsers promise failed: ' + error);
            });

        return deferred.promise;
    };

    restService.listDatasetsWithAttachments = function () {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');

        restclient.listDatasetsWithAttachments(clientUUID, Session.getToken()).then(

            function(response) {

                if (response.status.code === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var jsonResponse = JSON.parse(response.entity);
                    Session.updateToken(jsonResponse.token);

                    var responseBody = jsonResponse.response;

                    var parsedData =  restService.parseData(responseBody);

                    restService.updateCacheValue('data', parsedData);

                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log('restclient.listDatasetsWithAttachments succeeded');
                }
                else {
                    //If we did get data, but a bad status code, then the
                    //promise wrapped needs to handle the event like a rejection
                    deferred.reject([EVENTS.badStatus, response.status.code]);
                    console.log('restclient.listDatasetsWithAttachments promise succeeded ' + 'But with bad status code : ' + response.status.code);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.listDatasetsWithAttachments promise failed: ' + error);
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
            $.each(value.data, function(index, value){
                if(value.type === 'attachment') {
                    attachments.push(value);
                }
                else if(value.type === 'text') {
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

    //Get the URL where an attachment is hosted on the server.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.getAttachmentURL = function (ukey) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        var response = restclient.getAttachmentURL(clientUUID, Session.getToken(), uuid, filename);

        if (response) {
            deferred.resolve([EVENTS.promiseSuccess, response]);
            console.log('restclient.getAttachmentURL succeeded');
        }
        else {
            deferred.reject([EVENTS.promiseFailed]);
            console.log('restclient.getAttachmentURL promise failed');
        }

        return deferred.promise;
    };

    //Get the info about a specific attachment.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.getAttachmentInfo = function (ukey) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        restclient.getAttachmentInfo(clientUUID, Session.getToken(), uuid, filename).then(
            function(response) {

                //Parse out the data from the restclient response.
                var jsonResponse = JSON.parse(response.entity);
                Session.updateToken(jsonResponse.token);

                if (response.status.code === STATUS_CODES.ok) {
                    deferred.resolve([EVENTS.promiseSuccess, jsonResponse.response[0]]);
                    console.log('restclient.getAttachmentInfo succeeded');
                }
                else {
                    //If we did get data, but a bad status code, then the
                    //promise wrapped needs to handle the event like a rejection
                    deferred.reject([EVENTS.badStatus, response.status.code]);
                    console.log('restclient.getAttachmentInfo promise succeeded ' + 'But with bad status code : ' + response.status.code);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.getAttachmentInfo promise failed: ' + error);
            });
        return deferred.promise;
    };

    restService.submitData = function(dateCreated, createdBy, dataItems) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');

        restclient.submitData(clientUUID, Session.getToken(), dateCreated, createdBy, dataItems).then(
            function(response) {

                //Parse out the data from the restclient response.
                var jsonResponse = JSON.parse(response.entity);
                Session.updateToken(jsonResponse.token);

                if (response.status.code === STATUS_CODES.ok || response.status.code === STATUS_CODES.created) {
                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log('restclient.submitData succeeded');
                }
                else {
                    //If we did get data, but a bad status code, then the
                    //promise wrapped needs to handle the event like a rejection
                    deferred.reject([EVENTS.badStatus, response.status.code]);
                    console.log('restclient.getAttachmentInfo promise succeeded ' + 'But with bad status code : ' + response.status.code);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.getAttachmentInfo promise failed: ' + error);
            });
        return deferred.promise;
    };

    //Delete an attachment on the server.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.deleteAttachment = function (ukey) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        restclient.deleteAttachment(clientUUID, Session.getToken(), uuid, filename).then(

            function(response) {

                //Parse out the data from the restclient response.
                var jsonResponse = JSON.parse(response.entity);
                Session.updateToken(jsonResponse.token);

                if (response.status.code === STATUS_CODES.ok) {
                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log(filename + ' deleted');
                }
                else {
                    deferred.reject([EVENTS.badStatus, response.status.code]);
                    console.log('restclient.deleteAttachment promise succeeded ' + 'But with bad status code : ' + response.status.code);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.deleteAttachment promise failed: ' + error);
            });

        return deferred.promise;
    };

    //Rename an attachment on the server.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.renameAttachment = function (ukey, newFilename) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        restclient.renameAttachment(clientUUID, Session.getToken(), uuid, filename, newFilename).then(

            function(response) {

                //Parse out the data from the restclient response.
                var jsonResponse = JSON.parse(response.entity);
                Session.updateToken(jsonResponse.token);

                if (response.status.code === STATUS_CODES.ok) {
                    console.log(filename + ' renamed to ' + newFilename);
                }
                else {
                    deferred.reject([EVENTS.badStatus, response.status.code]);
                    console.log('restclient.renameAttachment promise succeeded ' + 'But with bad status code : ' + response.status.code);
                }

            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.renameAttachment promise failed: ' + error);
            }
        );
    };

    //Add a tag to a dataset.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.submitTag = function (ukey, type, description, value) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var uuid = ukey.split('\n')[1];

        restclient.submitTag(clientUUID, Session.getToken(), uuid, type, description, value).then(

            function(response) {

                //Parse out the data from the restclient response.
                var jsonResponse = JSON.parse(response.entity);
                Session.updateToken(jsonResponse.token);

                if (response.status.code === STATUS_CODES.ok) {
                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log(description + ':' + value + ' added to ' + ukey);
                }
                else {
                    console.log('restclient.submitTag promise succeeded ' + 'But with bad status code : ' + response.status.code);
                }

            },
            function(error) {
                console.log('restclient.submitTag promise failed: ' + error);
            }
        );

        return deferred.promise;
    };

    //Remove a tag from a dataset.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.deleteTag = function (ukey, type, description) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var uuid = ukey.split('\n')[1];

        restclient.deleteTag(clientUUID, Session.getToken(), uuid, type, description).then(

            function(response) {

                //Parse out the data from the restclient response.
                var jsonResponse = JSON.parse(response.entity);
                Session.updateToken(jsonResponse.token);

                if (response.status.code === STATUS_CODES.ok) {
                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log(description + ' removed from ' + ukey);
                }
                else {
                    console.log('restclient.deleteTag promise succeeded ' + 'But with bad status code : ' + response.status.code);
                }

            },
            function(error) {
                console.log('restclient.deleteTag promise failed: ' + error);
            }
        );

        return deferred.promise;
    };

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
    var refreshing = false;
    restService.refreshCache = function () {
        var deferred = $q.defer();

        if (refreshing) {
            deferred.resolve(true);
            return deferred.promise;
        }

        refreshing = true;
        restService.listAccessLevels().then(
            function() {
                restService.listClients().then(
                    function() {
                        restService.listUsers().then(
                            function() {
                                restService.listDatasetsWithAttachments().then(
                                    function() {
                                        deferred.resolve(true);
                                    },
                                    function() {
                                        deferred.reject(false);
                                    });
                            },
                            function() {
                                deferred.reject(false);
                            });
                    },
                    function() {
                        deferred.reject(false);
                    });
            },
            function() {
                deferred.reject(false);
            });

        refreshing = false;
        return deferred.promise;
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
        var newData = [];

        if(data) {
            $.each(data, function(index, value){
                if((value.uuid !== uuid) && (value.filename !== filename)) {
                    newData.push(value);
                }
            });

            restService.updateCacheValue('data', newData);
            return true;
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
                    function() {
                        //Data controller may tell the table to update.
                        deferred.resolve(true);
                    },
                    function() {
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
