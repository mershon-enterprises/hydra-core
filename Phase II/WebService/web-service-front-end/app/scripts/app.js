'use strict';

angular.module('webServiceApp', [
      'ngAnimate',
      'ngCookies',
      'ngResource',
      'ngRoute',    // Basic Angular Routing
      'ngSanitize'
    ])
    .config(function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/dataset.html',
          controller: 'DatasetCtrl'
        })
        .when('/clients', {
          templateUrl: 'views/clients.html',
          controller: 'ClientsCtrl'
        })
        .when('/users', {
          templateUrl: 'views/users.html',
          controller: 'UsersCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });
    })
    .constant('USER_ROLES', {
      operator: 'operator',
      office: 'office',
      admin: 'admin'
    })
    .constant('AUTH_EVENTS', {
      loginSuccess: 'auth-login-success',
      loginFailed: 'auth-login-failed',
      logoutSuccess: 'auth-logout-success',
      sessionTimeout: 'auth-session-timeout',
      notAuthenticated: 'auth-not-authenticated',
      notAuthorized: 'auth-not-authorized'
    });
