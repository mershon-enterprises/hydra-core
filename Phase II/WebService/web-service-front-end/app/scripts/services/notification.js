'use strict';

//Service wrapper for iGrowl notification tool.
angular.module('webServiceApp').service('NotificationService',
    function () {

    var notificationService = {};

    //Authenticate against the restclient. Create a new session if the restclient
    //returns status 200, and return false otherwise.
    notificationService.loginSuccess = function (title, message) {

        $.iGrowl({
            type: 'success',
            title: title,
            message: message,
            icon: 'linecons-paperplane'
        });

    };

    notificationService.loginFailed = function (title, message) {

        $.iGrowl({
            type: 'error',
            title: title,
            message: message,
            icon: 'linecons-lock'
        });

    };

    notificationService.success = function (title, message) {

        $.iGrowl({
            type: 'success',
            title: title,
            message: message,
            icon: 'linecons-like'
        });

    };

    notificationService.error = function (title, message) {

        $.iGrowl({
            type: 'error',
            title: title,
            message: message,
            icon: 'linecons-fire'
        });

    };

    notificationService.warning = function (title, message) {

        $.iGrowl({
            type: 'notice',
            title: title,
            message: message,
            icon: 'linecons-megaphone'
        });

    };

    notificationService.info = function (title, message) {

        $.iGrowl({
            type: 'info',
            title: title,
            message: message,
            icon: 'linecons-bubble'
        });

    };

  return notificationService;
});
