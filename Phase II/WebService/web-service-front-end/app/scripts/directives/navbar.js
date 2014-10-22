'use strict';

angular.module('webServiceApp').directive('navbar', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/navbar.html',
        controller: function ($scope, Session, EVENTS) {

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
