'use strict';

angular.module('webServiceApp').directive('navbar', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/navbar.html',
        controller: function ($scope, EVENTS) {

            $('.search').keyup(function() {
                //Get current value of input field after every key press.
                var currentValue = $(this).val();
                $('.ngColMenu').find('input').val(currentValue);
                $('.ngColMenu').find('input').trigger('input');
            });

            var self = this;
            self.isLoggedIn = false;

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
