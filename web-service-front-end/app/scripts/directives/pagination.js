'use strict';

//Pagination Directive

//Collects and parses search input.
angular.module('webServiceApp').directive('pagination', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/pagination.html',
    };
});
