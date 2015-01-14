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
                    $('.search-button').click();
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
                var searchString = $('.search').val();
                $rootScope.$broadcast(EVENTS.newSearch, $scope.parseSearch(searchString));
            });

            //Parse out the search parameters out of the search string.
            //Every parameter prefixed with - is a NOT parameter.
            //Every parameter prefixed with + is an AND parameter.
            //Every other prefix (no prefix) is an OR parameter.
            $scope.parseSearch = function(searchString) {
                var searchParams = {
                    or_search_strings: [],
                    and_search_strings: [],
                    not_search_strings: []
                };

                var params = searchString.split(' ');

                $.each(params, function(index, value){
                    if(value[0] === '+') {
                        searchParams.and_search_strings.push(value.slice(1));
                    }
                    else if(value[0] === '-') {
                        searchParams.not_search_strings.push(value.slice(1));
                    }
                    else {
                        searchParams.or_search_strings.push(value);
                    }
                });

                return searchParams;
            };
        },
        controllerAs: 'omnibox'
    };
});
