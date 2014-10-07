'use strict';

/**
 * @ngdoc overview
 * @name webServiceApp
 * @description
 * # webServiceApp
 *
 * Main module of the application.
 */
(function(){
  var app = angular
    .module('webServiceApp', [
      'ngAnimate',
      'ngCookies',
      'ngResource',
      'ngRoute',
      'ngSanitize',
      'ngTouch'
    ])
    .config(function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/main.html',
          controller: 'MainController'
        })
        .when('/clients', {
          templateUrl: 'views/clients.html',
          controller: 'ClientsController'
        })
        .when('/users', {
          templateUrl: 'views/users.html',
          controller: 'UsersController'
        })
        .otherwise({
          redirectTo: '/'
        });
    });
})();
