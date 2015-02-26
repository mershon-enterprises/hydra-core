'use strict';

//Navbar Directive

//Controls the display of various navigation elements and binds navigation hotkeys.
angular.module('webServiceApp').directive('share', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/share.html',
        controller: function ($scope) {

            $scope.shareMode = 'none';

            $scope.shareOptions = [
                {
                    'id': 'none',
                    'label': 'Nobody'
                },
                {
                    'id': 'all',
                    'label': 'All Authenticated Users'
                },
                {
                    'id': 'url',
                    'label': 'Anyone with the URL'
                },
                {
                    'id': 'specific',
                    'label': 'Specific Users'
                }
            ];

            $scope.shareFile = function() {
                switch ($scope.shareMode) {
                    case "none":
                        console.log("None!");
                    break;
                    case "all":
                        console.log("All!");
                    break;
                    case "url":
                        console.log("URL!");
                    break;
                    case "specific":
                        console.log("Specific!");
                    break;
                }
            };

        }
    };
});
