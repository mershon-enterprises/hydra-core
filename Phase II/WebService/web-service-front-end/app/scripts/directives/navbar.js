'use strict';

angular.module('webServiceApp').directive('navbar', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/navbar.html',
        controller: function ($rootScope, $scope, Session, EVENTS) {

            $rootScope.filterText = '';

            $('.search').keyup(function() {
                //Get current value of input field after every key press.
                var currentValue = $(this).val();
                $('.ngColMenu').find('input').val(currentValue);
                $('.ngColMenu').find('input').trigger('input');
                $rootScope.filterText = currentValue;
            });

            var self = this;
            self.isLoggedIn = Session.exists();

            $scope.$on(EVENTS.loginSuccess, function() {
                self.isLoggedIn = Session.exists();
            });

            $scope.$on(EVENTS.logoutSuccess, function() {
                self.isLoggedIn = Session.exists();
            });
        },
        controllerAs: 'nav'
    };
});
