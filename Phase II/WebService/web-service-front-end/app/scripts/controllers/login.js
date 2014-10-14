'use strict';

/**
 * @ngdoc function
 * @name webServiceApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the webServiceApp. Manages dataset data.
 */
angular.module('webServiceApp').controller('LoginCtrl',
 function ($scope, $rootScope, AUTH_EVENTS, AuthService, NotificationService, Session) {

  $scope.credentials = {
    email: '',
    password: ''
  };

  $scope.login = function (credentials) {
    AuthService.authenticate(credentials);
  };

  //Listener for a successful login.
  $scope.$on(AUTH_EVENTS.loginSuccess, function() {
    NotificationService.loginSuccess('Authentication Successful!', 'Welcome ' + Session.firstName + '!');
  });

  //Listener for a failed login.
  $scope.$on(AUTH_EVENTS.loginFailed, function() {
    NotificationService.loginFailed('Authentication Successful!', 'Please check your credentials.');
    Session.destroy();
  });

});

