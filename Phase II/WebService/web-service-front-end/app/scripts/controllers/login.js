'use strict';

/**
 * @ngdoc function
 * @name webServiceApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the webServiceApp. Manages dataset data.
 */
angular.module('webServiceApp').controller('LoginCtrl',
 function ($scope, $rootScope, AUTH_EVENTS, AuthService) {

  $scope.credentials = {
    username: '',
    password: ''
  };

  $scope.login = function (credentials) {
    AuthService.login(credentials).then(function (user) {
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      $scope.setCurrentUser(user);
      console.log("We did it!");
      console.log(user);
    }, function () {
      $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      console.log("Login failed.");
    });
  };

});

