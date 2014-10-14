'use strict';

/**
 * @ngdoc function
 * @name webServiceApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the webServiceApp. Manages dataset data.
 */
angular.module('webServiceApp').controller('LoginCtrl',
 function ($scope, $rootScope, AUTH_EVENTS, AuthService, Session) {

  $scope.credentials = {
    email: '',
    password: ''
  };

  $scope.login = function (credentials) {
    AuthService.authenticate(credentials);
  };

  //Listener for a successful login.
  $scope.$on(AUTH_EVENTS.loginSuccess, function(event, args) {
    console.log("Login Success!");
    //TODO Display To User Auth Succeeded.
  });

  //Listener for a failed login.
  $scope.$on(AUTH_EVENTS.loginFailed, function(event, args) {
    console.log("Login Failed!");
    Session.destroy;
    //TODO Display To User Auth Failed.
  });

});

