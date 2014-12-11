'use strict';

//Logout Controller

//Wipes all data stored to localstorage by the app, allowing it to return to a
//default state.
angular.module('webServiceApp').controller('LogoutCtrl',
 function ($scope, $rootScope, $location, EVENTS, NotificationService, RestService, Session) {

    $scope.logout = function () {
        Session.destroy();
        RestService.destroyCache();
        $rootScope.$broadcast(EVENTS.logoutSuccess);
        NotificationService.info('Logout Successful', 'Redirecting to home.');
        return $location.path('/');
    };

});
