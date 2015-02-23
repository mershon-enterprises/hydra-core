'use strict';

//Navbar Directive

//Controls the display of various navigation elements and binds navigation hotkeys.
angular.module('webServiceApp').directive('version', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/version.html',
        controller: function ($scope, localStorageService, RestService) {

            //If there already is a version in the cache, use it.
            $scope.productVersion = localStorageService.get('version');

            if(!$scope.productVersion) {
                //Collect the version of the app to be displayed in the UI.
                RestService.version().then(
                    function(success) {
                        $scope.productVersion = success[1];
                    },
                    function() {
                        console.log('Version component promise error.');
                    });
            }

        }
    };
});
