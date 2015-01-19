'use strict';

//Navbar Directive

//Controls the display of various UI elements depending on if user is logged
//in or not. Also feeds input from search box to ngGrid's filtering tools.
//Allows Nav Bar to be declared as an element in the markup.
angular.module('webServiceApp').directive('navbar', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/navbar.html',
        controller: function ($rootScope, $scope, $location, Session, EVENTS) {

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

            var self = this;
            self.isLoggedIn = Session.exists();

            $scope.$on(EVENTS.loginSuccess, function() {
                self.isLoggedIn = true;
            });

            $scope.$on(EVENTS.logoutSuccess, function() {
                self.isLoggedIn = false;
            });


            //Keyboard shortcuts
            Mousetrap.bind('/', function() {
                //Clear the search bar and focus on it
                $('input.search').val('');
                $('input.search').focus();
                // don't actually send the '/' character
                return false;
            });

            Mousetrap.bind('alt+u', function() {
                //Navigate to the Upload File screen
                $('a.upload-link').click();
                return false;
            });

            Mousetrap.bind('alt+c', function() {
                if ($rootScope.controller === 'AttachmentUpload') {
                    //Choose the file to upload
                    $('button.upload-button').click();
                }
                return false;
            });

            Mousetrap.bind('tab', function() {
                if ($rootScope.controller === 'AttachmentUpload') {
                    // if nothing is selected, don't worry about tab presses
                    var selected = $(document.activeElement);
                    if (selected.length === 0) {
                        return true;
                    }

                    // if both the description and value for a tag are set, and
                    // we are currently focused on the tag value, when the user
                    // presses tab, submit the current tag and create a new
                    // blank one
                    var tagIsDefined = ($('.tag-description').val() !== '' &&
                                        $('.tag-value').val() !== '');
                    if (tagIsDefined &&
                        selected.hasClass('tag-input') &&
                        selected.hasClass('tag-value')
                    ) {
                        $('.fa-plus').click();
                        $('.tag-description').focus();
                        return false;
                    } else {
                        return false;
                    }
                }
                return true;
            });

            Mousetrap.bind('alt+s', function() {
                if ($rootScope.controller === 'AttachmentUpload') {
                    //Save the file
                    $('button.file-action').click();
                }
                return false;
            });

            Mousetrap.bind('alt+f', function() {
                //Navigate to the Upload File screen
                $('a.file-explorer-link').click();
                return false;
            });

            Mousetrap.bind('escape', function() {
                //Clear the search and reset
                if ($rootScope.controller === 'AttachmentExplorer') {
                    $('.pages > li:contains("Reset")').click();
                    $('input.search').blur();
                }
                return false;
            });

            Mousetrap.bind('pageup', function() {
                if ($rootScope.controller === 'AttachmentExplorer') {
                    //Navigate to the previous page
                    $('.navigation-arrow.fa-angle-left').click();
                    console.log('page up pressed');
                }
                return false;
            });

            Mousetrap.bind('pagedown', function() {
                if ($rootScope.controller === 'AttachmentExplorer') {
                    //Navigate to the next page
                    $('.navigation-arrow.fa-angle-right').click();
                    console.log('page down pressed');
                }
                return false;
            });
        },
        controllerAs: 'nav'
    };
});
