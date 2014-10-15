'use strict';

/**
 * @ngdoc function
 * @name webServiceApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the webServiceApp. Manages dataset data.
 */
angular.module('webServiceApp').controller('LoginCtrl',
 function ($scope, $rootScope, EVENTS, RestService, NotificationService, Session) {

  $scope.credentials = {
    email: '',
    password: ''
  };

  $scope.login = function (credentials) {
    RestService.authenticate(credentials);
  };

  //Listener for a successful login.
  $scope.$on(EVENTS.loginSuccess, function() {
    NotificationService.loginSuccess('Authentication Successful!', 'Welcome ' + Session.firstName + '!');
  });

  //Listener for a failed login.
  $scope.$on(EVENTS.loginFailed, function() {
    NotificationService.loginFailed('Authentication Successful!', 'Please check your credentials.');
    Session.destroy();
  });

});

