'use strict';

//RestService Factory

//AngularJS Factory wrapper for the restclient. Handles parsing the server's
//response from every restclient call, console logging when errors occur, and
//then using $q service to return a promise object.
angular.module('webServiceApp').factory('RestService',
    function (
                $rootScope,
                $q,
                localStorageService,
                Session,
                NotificationService,
                EVENTS,
                STATUS_CODES
    ){

    var restService = {};

    //Generate a unique ID for this client if one doesn't exist.
    restService.updateClientUUID = function () {
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

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    //Parse out the data we want.
                    var jsonResponse = response.entity;
                    var responseBody = jsonResponse.response;
                    var token = jsonResponse.token;

                    var tokenExpirationDate = response.token_expiration_date;
                    var email = responseBody.email_address;
                    var firstName = responseBody.first_name;
                    var lastName = responseBody.last_name;
                    var permissions = responseBody.access;

                    //Populate the Session singleton with the user data
                    Session.create( tokenExpirationDate,
                                    token,
                                    email,
                                    firstName,
                                    lastName,
                                    permissions
                    );

                    //Create the cache for this user's data
                    $rootScope.$broadcast(EVENTS.cacheCreate);

                    //Mark that we have received data
                    deferred.resolve([EVENTS.promiseSuccess]);
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('authenticate', statusCode);
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

    //Returns the authenticator used by the service back-end.
    restService.getAuthenticator = function () {

        var deferred = $q.defer();

        restclient.getAuthenticator().then(

            function(response) {

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    var jsonResponse = response.entity;

                    deferred.resolve([EVENTS.promiseSuccess, jsonResponse]);
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('authenticator', statusCode);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.getAuthenticator promise failed: ' + error);
            });

        return deferred.promise;
    };

    //Returns the branding used by the service back-end.
    restService.getBranding = function () {
      var deferred = $q.defer();
      restclient.getBranding().then(
          function(response) {
            var statusCode = response.status.code;
            if (statusCode === STATUS_CODES.ok) {
              var jsonResponse = response.entity;
              deferred.resolve([EVENTS.promiseSuccess, jsonResponse]);
            } else {
              deferred.reject([EVENTS.badStatus, statusCode]);
              restService.statusHandler('branding', statusCode);
            }
          },
          function(error) {
            deferred.reject([EVENTS.promiseFailed, error]);
            console.log('restclient.getBranding promise failed: ' + error);
          });
      return deferred.promise;
    };

    //Returns the version of the service back-end.
    restService.getVersion = function () {

        var deferred = $q.defer();

        restclient.getVersion().then(

            function(response) {

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    var jsonResponse = response.entity.version;

                    deferred.resolve([EVENTS.promiseSuccess, jsonResponse]);
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('version', statusCode);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.getVersion promise failed: ' + error);
            });

        return deferred.promise;
    };

    //Returns the access levels available to the current user.
    restService.listAccessLevels = function () {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');

        restclient.listAccessLevels(clientUUID, Session.getToken()).then(

            function(response) {

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {
                    //Parse out the data from the restclient response.
                    var jsonResponse = response.entity;
                    Session.updateToken(jsonResponse.token);

                    var responseBody = jsonResponse.response;

                    $rootScope.$broadcast(EVENTS.cacheUpdate, ['accessLevels', responseBody]);

                    deferred.resolve([EVENTS.promiseSuccess]);
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('listAccessLevels', statusCode);
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

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var jsonResponse = response.entity;
                    Session.updateToken(jsonResponse.token);

                    var responseBody = jsonResponse.response;

                    $rootScope.$broadcast(EVENTS.cacheUpdate, ['clients', responseBody]);

                    deferred.resolve([EVENTS.promiseSuccess]);
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('listClients', statusCode);
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

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var jsonResponse = response.entity;
                    Session.updateToken(jsonResponse.token);

                    var responseBody = jsonResponse.response;

                    $rootScope.$broadcast(EVENTS.cacheUpdate, ['users', responseBody]);


                    deferred.resolve([EVENTS.promiseSuccess]);
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('listUsers', statusCode);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.listUsers promise failed: ' + error);
            });

        return deferred.promise;
    };

    restService.listAttachments = function (searchParams) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');

        restclient.listAttachments(clientUUID, Session.getToken(), searchParams).then(

            function(response) {

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var jsonResponse = response.entity;

                    Session.updateToken(jsonResponse.token);

                    var responseBody = jsonResponse.response;

                    var parsedData =  restService.parseData(responseBody.attachments);

                    var resultCount =  responseBody.result_count;

                    deferred.resolve([EVENTS.promiseSuccess, parsedData, resultCount]);

                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('listAttachments', statusCode);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.listAttachments promise failed: ' + error);
            });
        return deferred.promise;
    };

    //Parse the data from the restClient into a format the attachment_explorer
    //wants.
    //"unique_key" uniquely identifies the file row for controller use
    //"share_state" creates a value ng-switch can use to display share state.
    restService.parseData = function (rawData) {

        var data = [];
        var uniqueKey = null;
        var shareState = null;

        if (rawData) {
            $.each(rawData, function(index, value){

                if(value.is_shared_with_me) {
                    shareState = {share_state: 'me'};
                }
                else if (value.is_shared_with_others) {
                    shareState = {share_state: 'others'};
                }
                else {
                    shareState = {share_state: 'none'};
                }

                uniqueKey = {unique_key: value.filename + '\n' + value.data_set_uuid};
                $.extend(uniqueKey, shareState);
                data.push($.extend(value, uniqueKey));

            });
        }

        return data;
    };

    //Get the URL where an attachment is hosted on the server.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.getAttachmentURL = function (ukey) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        var response = restclient.getAttachmentURL(
                                                    clientUUID,
                                                    Session.getToken(),
                                                    uuid,
                                                    filename
        );

        if (response) {
            deferred.resolve([EVENTS.promiseSuccess, response]);
        }
        else {
            deferred.reject([EVENTS.promiseFailed]);
            console.log('restclient.getAttachmentURL promise failed');
        }

        return deferred.promise;
    };

    //Get the file details about a specific attachment.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.getAttachmentInfo = function (ukey) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        restclient.getAttachmentInfo(   clientUUID,
                                        Session.getToken(),
                                        uuid,
                                        filename
        ).then(
            function(response) {

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var entity = response.entity;
                    Session.updateToken(entity.token);

                    deferred.resolve([  EVENTS.promiseSuccess,
                                        entity.response[0]]
                    );
                }
                else if (statusCode === STATUS_CODES.forbidden) {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    NotificationService.error('Access Denied', response.entity.response);
                }
                else {
                    restService.statusHandler('getAttachmentInfo', statusCode);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.getAttachmentInfo promise failed: ' + error);
            });
        return deferred.promise;
    };

    //Get the share link for a specific attachment.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.getAttachmentDownloadLink = function (ukey, expirationDate) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        restclient.getAttachmentDownloadLink(   clientUUID,
                                                Session.getToken(),
                                                uuid,
                                                filename,
                                                expirationDate
        ).then(
            function(response) {

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var entity = response.entity;
                    Session.updateToken(entity.token);

                    deferred.resolve([  EVENTS.promiseSuccess,
                                        entity.response[0]]
                    );
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('getAttachmentDownloadLink', statusCode);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.getAttachmentDownloadLink promise failed: ' + error);
            });
        return deferred.promise;
    };

    //Get the current sharing state of a file and details about when the file
    //was shared.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.getAttachmentSharingInfo = function (ukey) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        restclient.getAttachmentSharingInfo(    clientUUID,
                                                Session.getToken(),
                                                uuid,
                                                filename
        ).then(
            function(response) {

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var entity = response.entity;
                    Session.updateToken(entity.token);

                    deferred.resolve([  EVENTS.promiseSuccess,
                                        entity.response]
                    );
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('getAttachmentSharingInfo', statusCode);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.getAttachmentSharingInfo promise failed: ' + error);
            });
        return deferred.promise;
    };

    //Share an attachment with all users or a subset of users.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.shareAttachment = function (ukey, startDate, expDate, userEmailList) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        restclient.shareAttachment(             clientUUID,
                                                Session.getToken(),
                                                uuid,
                                                filename,
                                                startDate,
                                                expDate,
                                                userEmailList
        ).then(
            function(response) {

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var entity = response.entity;
                    Session.updateToken(entity.token);

                    deferred.resolve([  EVENTS.promiseSuccess,
                                        entity.response[0]]
                    );
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('shareAttachment', statusCode);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.shareAttachment promise failed: ' + error);
            });
        return deferred.promise;
    };

    //Stop sharing an attachment with all users.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.stopSharingAttachment = function (ukey) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        restclient.stopSharingAttachment(   clientUUID,
                                                Session.getToken(),
                                                uuid,
                                                filename
        ).then(
            function(response) {

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var entity = response.entity;
                    Session.updateToken(entity.token);

                    deferred.resolve([  EVENTS.promiseSuccess,
                                        entity.response[0]]
                    );
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('stopSharingAttachment', statusCode);
                }
            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.stopSharingAttachment promise failed: ' + error);
            });
        return deferred.promise;
    };

    //Submits a new attachment to the backend.
    restService.submitData = function(dateCreated, createdBy, dataItems) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');

        NProgress.start();

        // In order to be memory efficient, we must drop back to using
        // XMLHttpRequests here...
        var form = new FormData();
        form.append('client_uuid', clientUUID);
        form.append('api_token', Session.getToken());
        form.append('uuid', restclient.uuid());
        form.append('date_created', dateCreated.toISOString());
        form.append('created_by', createdBy);
        form.append('data', JSON.stringify(dataItems));

        var x = new XMLHttpRequest();
        x.open('POST', restclient.endpointUrl + '/data');

        // progress notifier
        x.addEventListener('progress', function(progressEvent) {
            if (progressEvent.lengthComputable) {
                NProgress.set(progressEvent.loaded / progressEvent.total);
            }
        }, false);

        x.onreadystatechange = function() {

            if(x.readyState === 4) {

                var statusCode = x.status;

                if (statusCode === STATUS_CODES.created) {
                    Session.updateToken(JSON.parse(x.response).token);
                    deferred.resolve([EVENTS.promiseSuccess]);
                }
                else {
                    deferred.reject([EVENTS.badStatus]);
                    restService.statusHandler('submitData', statusCode);
                }

                NProgress.done();

            }
        };

        x.send(form);

        return deferred.promise;
    };

    restService.reprocessData = function (ukey) {
        var deferred = $q.defer();
        var clientUUID = localStorageService.get('clientUUID');
        var uuid = ukey.split('\n')[1];

        restclient.reprocessData(clientUUID, Session.getToken(), uuid).then(
            function(response) {
                var statusCode = response.status.code;
                if (statusCode === STATUS_CODES.created) {
                    //Parse out the data from the restclient response.
                    var entity = response.entity;
                    Session.updateToken(entity.token);

                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log("Data set " + uuid + " reprocessed.");
                } else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('reprocessData', statusCode);
                }
            },
            function(error) {
                console.log('restclient.reprocessData promise failed: ' + error);
            }
        );
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

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var entity = response.entity;
                    Session.updateToken(entity.token);

                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log(filename + ' deleted');
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('deleteAttachment', statusCode);
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

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var entity = response.entity;
                    Session.updateToken(entity.token);

                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log(filename + ' renamed to ' + newFilename);
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('renameAttachment', statusCode);
                }

            },
            function(error) {
                deferred.reject([EVENTS.promiseFailed, error]);
                console.log('restclient.renameAttachment promise failed: ' + error);
            });

        return deferred.promise;
    };

    //Replaces a new attachment on the backend.
    restService.replaceAttachment = function(ukey, newContents) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var filename = ukey.split('\n')[0];
        var uuid = ukey.split('\n')[1];

        NProgress.start();

        // In order to be memory efficient, we must drop back to using
        // XMLHttpRequests here...
        var form = new FormData();
        form.append('client_uuid', clientUUID);
        form.append('api_token', Session.getToken());
        form.append('uuid', uuid);
        form.append('filename', filename);
        form.append('new_contents', newContents);

        var x = new XMLHttpRequest();
        x.open('PUT', restclient.endpointUrl + '/data/' +
                                               uuid + '/' +
                                               filename + '/replace');

        // progress notifier
        x.addEventListener('progress', function(progressEvent) {
            if (progressEvent.lengthComputable) {
                NProgress.set(progressEvent.loaded / progressEvent.total);
            }
        }, false);

        x.onreadystatechange = function() {

            if(x.readyState === 4) {
                var statusCode = x.status;
                if (statusCode === STATUS_CODES.ok) {

                    Session.updateToken(JSON.parse(x.response).token);

                    deferred.resolve([EVENTS.promiseSuccess]);
                }
                else {
                    deferred.reject([EVENTS.badStatus]);
                    restService.statusHandler('replaceAttachment', statusCode);
                }

                NProgress.done();
            }
        };

        x.send(form);

        return deferred.promise;
    };

    //Add a tag to a dataset.
    //ukey = 'filename' + '\n' + 'uuid'
    restService.submitTag = function (ukey, type, description, value) {

        var deferred = $q.defer();

        var clientUUID = localStorageService.get('clientUUID');
        var uuid = ukey.split('\n')[1];

        restclient.submitTag(clientUUID, Session.getToken(), uuid, type, description, value).then(

            function(response) {

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var entity = response.entity;
                    Session.updateToken(entity.token);

                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log(description + ':' + value + ' added to ' + ukey);
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('submitTag', statusCode);
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

                var statusCode = response.status.code;

                if (statusCode === STATUS_CODES.ok) {

                    //Parse out the data from the restclient response.
                    var entity = response.entity;
                    Session.updateToken(entity.token);

                    deferred.resolve([EVENTS.promiseSuccess]);
                    console.log(description + ' removed from ' + ukey);
                }
                else {
                    deferred.reject([EVENTS.badStatus, statusCode]);
                    restService.statusHandler('deleteTag', statusCode);
                }

            },
            function(error) {
                console.log('restclient.deleteTag promise failed: ' + error);
            }
        );

        return deferred.promise;
    };

    restService.statusHandler = function (methodName, statusCode) {
        console.log(methodName + ' returned bad status code : ' + statusCode);
        if (statusCode === STATUS_CODES.unauthorized) {

            $rootScope.$broadcast(EVENTS.logoutAction);

        }
    };

    return restService;
});
