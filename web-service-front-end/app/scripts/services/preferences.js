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
        order: 'desc'
    };

    preferences.paginationParams = {
        currentPage: 0,
        paginationPages: []
    };

    return preferences;
});
