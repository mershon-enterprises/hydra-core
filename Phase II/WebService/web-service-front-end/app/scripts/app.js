'use strict';

angular.module('webServiceApp', [
      'ngAnimate',
      'ngResource',
      'ngRoute',    // Basic Angular Routing
      'ngSanitize',
      'LocalStorageModule', // Angular Localstorage
      'ngGrid' // Angular Table Directive
    ])
    .config(function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'templates/dataset.html',
          controller: 'DatasetCtrl'
        })
        .when('/clients', {
          templateUrl: 'templates/clients.html',
          controller: 'ClientsCtrl'
        })
        .when('/users', {
          templateUrl: 'templates/users.html',
          controller: 'UsersCtrl',
          controllerAs: 'users'
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
    .constant('EVENTS', {
      loginSuccess: 'auth-login-success',
      loginFailed: 'auth-login-failed',
      logoutSuccess: 'auth-logout-success',
      dataRetrieved: 'data-retrieved',
      dataLost: 'data-lost',
      sessionTimeout: 'auth-session-timeout',
      notAuthorized: 'auth-not-authorized',
    })
    .constant('STATUS_CODES', {
      ok: 200,
      movedPermanently: 301,
      badRequest: 400,
      notAuthorized: 401,
      forbidden: 403,
      notFound: 404,
      internalServerError: 500
    });
