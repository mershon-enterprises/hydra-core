'use strict';

//Navbar Directive

//Controls the display of various UI elements depending on if user is logged
//in or not. Also feeds input from search box to ngGrid's filtering tools.
//Allows Nav Bar to be declared as an element in the markup.
angular.module('webServiceApp').directive('navbar', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/navbar.html',
        controller: function ($scope, Session, EVENTS) {

            $('.search').keyup(function() {
                //Get current value of input field after every key press.
                var currentValue = $(this).val();
                $('.ngColMenu').find('input').val(currentValue);
                $('.ngColMenu').find('input').trigger('input');
            });

            var self = this;
            self.isLoggedIn = Session.exists();

            $scope.$on(EVENTS.loginSuccess, function() {
                self.isLoggedIn = true;
            });

            $scope.$on(EVENTS.logoutSuccess, function() {
                self.isLoggedIn = false;
            });
        },
        controllerAs: 'nav'
    };
});
