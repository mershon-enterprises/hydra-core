'use strict';

angular.module('webServiceApp', [
      'ngRoute',    // Basic Angular Routing
      'LocalStorageModule', // Angular Localstorage
      'file-model', //Angular File Directives
      'ui.date' //Integration with jQueryUI Datepicker
    ])
    .config(function ($routeProvider, localStorageServiceProvider) {
      //Routes. When user visits various URLs, navigate them to specific views
      //and bring controllers into scope. "loggedInOnly" means the route cannot
      //be visited if the user has no session.
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

      //Add a prefix to everything saved in localstorage to prevent collissions
      //with other applications.
      localStorageServiceProvider.setPrefix('pi-hydra');
    })
    //Constants to be used in the application instead of strings that can
    //be mistyped.
    .constant('USER_ROLES', {
      operator: 'operator',
      office: 'office',
      admin: 'admin'
    })
    .constant('EVENTS', {
      loginSuccess: 'auth-login-success',
      loginFailed: 'auth-login-failed',
      logoutSuccess: 'auth-logout-success',
      cacheReset: 'cache-reset',
      cacheReady: 'cache-ready',
      promiseSuccess: 'promise-success',
      promiseFailed: 'promise-failed',
      badStatus: 'bad-status',
      newSearch: 'new-search',
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
