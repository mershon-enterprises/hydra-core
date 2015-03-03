'use strict';

angular.module('webServiceApp', [
      'ngRoute',    // Basic Angular Routing
      'ngModal', //Modal Directive
      'LocalStorageModule', // Angular Localstorage
      'file-model', //Angular File Directives
      'selectize'
    ])
    .config(function ($routeProvider, localStorageServiceProvider, ngModalDefaultsProvider) {
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
        .when('/manual', {
          templateUrl: 'templates/documentation.html',
          controller: 'DocumentationCtrl',
          loggedInOnly: false
        })
        .otherwise({
          redirectTo: '/'
        });

      //Add a prefix to everything saved in localstorage to prevent collissions
      //with other applications.
      localStorageServiceProvider.setPrefix('pi-hydra');

      //Change default settings about ngModal directive.
      ngModalDefaultsProvider.set('closeButtonHtml', '<i class="fa fa-times"></i>');
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
      logoutAction: 'logout-action',
      logoutSuccess: 'auth-logout-success',
      cacheCreate: 'cache-create',
      cacheReset: 'cache-reset',
      cacheReady: 'cache-ready',
      cacheUpdate: 'cache-update',
      promiseSuccess: 'promise-success',
      promiseFailed: 'promise-failed',
      badStatus: 'bad-status',
      newSearch: 'new-search',
    })
    .constant('STATUS_CODES', {
      ok: 200,
      created: 201,
      unauthorized: 401,
      forbidden: 403
    });
