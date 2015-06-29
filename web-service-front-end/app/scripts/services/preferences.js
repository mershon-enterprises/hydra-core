'use strict';

//The Preferences service will be used to maintain user-set options throughout
//the app without cluttering things like the session, which is meant for
//authentication/profile related tasks.
angular.module('webServiceApp').factory('Preferences', function () {

    var preferences = {};

    preferences.searchParams = {
        or_search_strings: [],
        and_search_strings: [],
        not_search_strings: [],
        limit: 25,
        offset: 0,
        order_by: 'date_created',
        order: 'desc',
        is_shared_with_me: null,
        is_shared_with_others: null
    };

    preferences.paginationParams = {
        currentPage: 1,
        paginationPages: []
    };

    //Resets the stored preferences to their defaults.
    //Caution : Do not rebind new objects onto this service's variables.
    //ex. preferences.searchParams = {...}
    //Doing so will detach this services from whatever controller is using it.
    //That's why we need to set all of the object properties manually.
    preferences.reset = function() {
        preferences.searchParams.or_search_strings = [];
        preferences.searchParams.and_search_strings = [];
        preferences.searchParams.not_search_strings = [];
        preferences.searchParams.limit = 25;
        preferences.searchParams.offset = 0;
        preferences.searchParams.order_by = 'date_created';
        preferences.searchParams.order = 'desc';
        preferences.searchParams.is_shared_with_me = null;
        preferences.searchParams.is_shared_with_others = null;

        preferences.currentPage = 1;
        preferences.paginationPages = [];
    };

    return preferences;
});
