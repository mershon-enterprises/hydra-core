'use strict';

//Omnibox Directive

//Collects and parses search input.
angular.module('webServiceApp').directive('omnibox', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/omnibox.html',
        controller: function ($rootScope, $scope, $location, EVENTS) {
            $('.search').keyup(function(event) {
                 if ( event.which === 13 ) {
                    event.preventDefault();
                    $rootScope.$broadcast(EVENTS.newSearch, $(this).val());
                }
            });

            $('.search-button').click(function() {
                if($rootScope.controller !== 'AttachmentExplorer') {
                    var ans = confirm('Cancel your work and return to the file explorer?');
                    if(ans) {
                        $location.path('/attachment_explorer');
                        //forces Angular to update, since normally the $digest wont
                        //trigger when a directive asks to change location.
                        //http://stackoverflow.com/questions/17177492/location-path-not-working-inside-an-angular-directive
                        $scope.$apply();
                    }
                }
                $rootScope.$broadcast(EVENTS.newSearch, $('.search').val());
            });
        },
        controllerAs: 'omnibox'
    };
});
