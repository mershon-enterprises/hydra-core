'use strict';

/**
 * @ngdoc function
 * @name webServiceApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the webServiceApp. Manages dataset data.
 */
angular.module('webServiceApp').controller('LoginCtrl',
 function ($scope, $rootScope, $location, EVENTS, RestService, NotificationService, Session) {

    $scope.credentials = {
        email: '',
        password: ''
    };

    $scope.login = function (credentials) {
      RestService.authenticate(credentials);
    };

    //Listens for route changes, verifies someone is logged in. If they are not,
    //redirect to root.
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        if (next.loggedInOnly && !Session.exists()) {
            $location.replace();
            return $location.path("/");
        }
    });

    //Listener for a successful login.
    $scope.$on(EVENTS.loginSuccess, function() {
        NotificationService.loginSuccess('Authentication Successful!', 'Welcome ' + Session.firstName + '!');
    });

    //Listener for a failed login.
    $scope.$on(EVENTS.loginFailed, function() {
        NotificationService.loginFailed('Authentication Failure...', 'Please check your credentials.');
        Session.destroy();
    });

});

