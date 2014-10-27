'use strict';

angular.module('webServiceApp', [
      'ngRoute',    // Basic Angular Routing
      'LocalStorageModule', // Angular Localstorage
      'ngGrid' // Angular Table Directive
    ])
    .config(function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'templates/login.html',
          loggedInOnly: false
        }).when('/datasets', {
          templateUrl: 'templates/datasets.html',
          controller: 'DatasetsCtrl',
          loggedInOnly: true
        })
        .when('/upload', {
          templateUrl: 'templates/upload.html',
          controller: 'UploadCtrl',
          loggedInOnly: true
        })
        .when('/clients', {
          templateUrl: 'templates/clients.html',
          controller: 'ClientsCtrl',
          loggedInOnly: true
        })
        .when('/users', {
          templateUrl: 'templates/users.html',
          controller: 'UsersCtrl',
          controllerAs: 'users',
          loggedInOnly: true
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
      accessLevelsRetrieved: 'access-levels-retrieved',
      clientsRetrieved: 'clients-retrieved',
      dataRetrieved: 'data-retrieved',
      usersRetrieved: 'users-retrieved',
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
