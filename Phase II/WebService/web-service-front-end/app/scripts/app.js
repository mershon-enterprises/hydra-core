'use strict';

angular.module('webServiceApp', [
      'ngRoute',    // Basic Angular Routing
      'LocalStorageModule', // Angular Localstorage
      'ngGrid', // Angular Table Directive
      'file-model'
    ])
    .config(function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'templates/login.html',
          loggedInOnly: false
        }).when('/attachment_explorer', {
          templateUrl: 'templates/attachment_explorer.html',
          controller: 'AttachmentExplorerCtrl',
          loggedInOnly: true
        })
        .when('/attachment_details', {
          templateUrl: 'templates/attachment_details.html',
          controller: 'AttachmentDetailsCtrl',
          loggedInOnly: true
        })
        .when('/attachment_upload', {
          templateUrl: 'templates/attachment_upload.html',
          controller: 'AttachmentUploadCtrl',
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
      cacheRefresh: 'cache-refresh',
      cacheReady: 'cache-ready',
      promiseSuccess: 'promise-success',
      promiseFailed: 'promise-failed',
      badStatus: 'bad-status',
      sessionTimeout: 'auth-session-timeout',
      notAuthorized: 'auth-not-authorized'
    })
    .constant('STATUS_CODES', {
      ok: 200,
      created: 201,
      movedPermanently: 301,
      badRequest: 400,
      notAuthorized: 401,
      forbidden: 403,
      notFound: 404,
      internalServerError: 500
    });
