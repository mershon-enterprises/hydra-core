'use strict';

//CACHE ========================================================================
//The CacheService provides an interface between the data collected from the
//restClient/restService and the Angular localStorageService. It allows
//persistence of data that should be only collected once.
angular.module('webServiceApp').factory('CacheService', function ($rootScope, $q, localStorageService, RestService, EVENTS) {

    var cacheService = {};

    //Create keys for our application in localStorage. If the keys are created
    //broadcast to anything waiting for a valid cache that the cache is ready.
    cacheService.createCache = function () {
        //Create the empty keys in localstorage.
        localStorageService.set('accessLevels', null);
        localStorageService.set('cacheReady', null);
        localStorageService.set('clients', null);
        localStorageService.set('users', null);
        localStorageService.set('version', null);

        //Ask the cache to refresh itself by invoking many restService calls
        //to populate the above keys.
        cacheService.refreshCache().then(
            function(success) {
                //Once the cache is ready, signal to the rest of the app
                //that the cache is in a valid state.
                if (success) {
                    cacheService.updateCacheValue('cacheReady', true);
                    $rootScope.$broadcast(EVENTS.cacheReady);
                    console.log('refreshCache succeed.');
                }
            },
            function(error) {
                console.log('refreshCache failed.');
                console.log(error);
            });
    };

    //Refreshes the cache by invoking many restclient/restservice methods
    //and updating localStorage with the values returned to it.
    var refreshing = false;
    cacheService.refreshCache = function () {
        var deferred = $q.defer();

        if (refreshing) {
            deferred.resolve(true);
            return deferred.promise;
        }

        refreshing = true;
        var userAccess = localStorageService.get('permissions');
        RestService.listAccessLevels().then(
            function() {
                // Not all users can view all clients
                if (userAccess.indexOf('Manage Clients') === -1 &&
                    userAccess.indexOf('View Clients') === -1) {
                    deferred.resolve(true);
                } else {
                    return RestService.listClients();
                }
            },
            function() {
                deferred.reject(false);
            }
        ).then(
            function() {
                // Not all users can manage other users
                if (userAccess.indexOf('Manage Users') === -1) {
                    deferred.resolve(true);
                } else {
                    return RestService.listUsers();
                }
            },
            function() {
                deferred.reject(false);
            }
        ).then(
            function() {
                deferred.resolve(true);
            },
            function() {
                deferred.reject(false);
            }
        );

        refreshing = false;
        return deferred.promise;
    };

    //Updates a cache value in localStorage with a given key.
    cacheService.updateCacheValue = function (key, data) {
        if (key === 'accessLevels') {
            localStorageService.set('accessLevels', data);
        }
        else if (key === 'cacheReady') {
            localStorageService.set('cacheReady', data);
        }
        else if (key === 'clients') {
            localStorageService.set('clients', data);
        }
        else if (key === 'users') {
            localStorageService.set('users', data);
        }
        else if (key === 'version') {
            localStorageService.set('version', data);
        }
    };

    //Returns a cache value from localStorage with a given key.
    cacheService.getCacheValue = function (key) {
        if (key === 'accessLevels') {
            return localStorageService.get('accessLevels');
        }
        else if (key === 'cacheReady') {
            return localStorageService.get('cacheReady');
        }
        else if (key === 'clients') {
            return localStorageService.get('clients');
        }
        else if (key === 'users') {
            return localStorageService.get('users');
        }
        else if (key === 'clientUUID') {
            return localStorageService.get('clientUUID');
        }
        else if (key === 'version') {
            return localStorageService.get('version');
        }
    };

    //Destroy the cache values and their keys from localStorage.
    cacheService.destroyCache = function () {
        localStorageService.set('accessLevels', null);
        localStorageService.set('cacheReady', null);
        localStorageService.set('clients', null);
        localStorageService.set('users', null);
        localStorageService.set('version', null);
        localStorageService.remove('accessLevels');
        localStorageService.remove('cacheReady');
        localStorageService.remove('clients');
        localStorageService.remove('users');
        localStorageService.remove('version');
    };

    //Checks if localStorage keys for our app exist.
    cacheService.exists = function() {
        if (localStorageService.keys().length === 0) {
            return false;
        }
        return true;
    };

    //Create the cache if the create event is broadcast.
    $rootScope.$on(EVENTS.cacheCreate, function() {
        cacheService.createCache();
    });

    //Reset the cache if the reset event is broadcast.
    $rootScope.$on(EVENTS.cacheReset, function() {
        cacheService.destroyCache();
        cacheService.createCache();
    });

    //Update the cache if the update event is broadcast.
    $rootScope.$on(EVENTS.cacheUpdate, function(event, update) {
        var key = update[0];
        var value = update[1];
        cacheService.updateCacheValue(key, value);
    });

    return cacheService;
});
