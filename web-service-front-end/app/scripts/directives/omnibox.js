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
                var finalParams = [];
                var buffer = '';
                var single = '\'';
                var double = '\"';

                //Handles the +"Kern River" use case. We need to search through
                //the params looking for ' or " marks and combine them into
                //single search terms after performing string.split() on spaces.
                $.each(params, function(index, value) {
                    console.log(value);
                    //If you found a quote and there's nothing in the buffer, add this value to the buffer.
                    if (((value.indexOf(single) > -1) || (value.indexOf(double) > -1)) && (buffer.length === 0)) {
                        buffer += value;
                    }
                    //If you didn't find a quote and the buffer is non-empty, add this value onto the buffer with a space.
                    else if (((value.indexOf(single) === -1) && (value.indexOf(double) === -1)) && (buffer.length > 0)) {
                        buffer += ' ';
                        buffer += value;
                    }
                    //If you found a quote and the buffer is non-empty, add this last value to the buffer, add the buffer to the finalParams, clear the buffer.
                    else if (((value.indexOf(single) > -1) || (value.indexOf(double) > -1)) && (buffer.length > 0)) {
                        buffer += ' ';
                        buffer += value;
                        buffer = buffer.replace(/["']/g, '');
                        finalParams.push(buffer);
                        buffer = '';
                    }
                    //Just add the value in.
                    else {
                        finalParams.push(value);
                    }
                });

                //Then we need to go through the finalized search params and
                //sort them by AND, OR, and NOT. Then they will be sent to the
                //backend.
                $.each(finalParams, function(index, value) {
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
