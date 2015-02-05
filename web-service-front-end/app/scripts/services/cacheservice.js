'use strict';

//CACHE ========================================================================
//The cache is a where data retrived from the restclient are stored in memory.
angular.module('webServiceApp').factory('CacheService', function ($rootScope, $q, localStorageService, RestService, EVENTS) {

    var cacheService = {};

    //Create the cache keys in localstorage.
    cacheService.createCache = function () {
        localStorageService.set('accessLevels', null);
        localStorageService.set('cacheReady', null);
        localStorageService.set('clients', null);
        localStorageService.set('users', null);
        cacheService.refreshCache().then(
            function(success) {
                //Once the cache is ready, signal to the rest of the app
                //that restclient calls may be used.
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

    //Invoke all restservice methods to repopulate the cache with new values
    //from the restAPI. Returns a promise.
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

    //Updates a cache value in localstorage with a given key.
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
    };

    //Returns a cache value from localstorage with a given key.
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
    };

    //Destroy the cache values and their keys from local storage.
    cacheService.destroyCache = function () {
        localStorageService.set('accessLevels', null);
        localStorageService.set('cacheReady', null);
        localStorageService.set('clients', null);
        localStorageService.set('users', null);
        localStorageService.remove('accessLevels');
        localStorageService.remove('cacheReady');
        localStorageService.remove('clients');
        localStorageService.remove('users');
    };

    //Reset the cache if the reset event is broadcast.
    $rootScope.$on(EVENTS.cacheCreate, function() {
        cacheService.createCache();
    });

    //Reset the cache if the reset event is broadcast.
    $rootScope.$on(EVENTS.cacheReset, function() {
        cacheService.destroyCache();
        cacheService.createCache();
    });

    //Update the cache with the given key and value.
    $rootScope.$on(EVENTS.cacheUpdate, function(event, update) {
        var key = update[0];
        var value = update[1];
        cacheService.updateCacheValue(key, value);
    });

    return cacheService;
});
