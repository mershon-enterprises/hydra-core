'use strict';

angular.module('webServiceApp').controller('LogoutCtrl',
 function ($scope, $rootScope, $location, EVENTS, NotificationService, Session) {

    $scope.logout = function () {
        Session.destroy();
        $rootScope.$broadcast(EVENTS.logoutSuccess);
        NotificationService.info('Logout Successful', 'Redirecting to home.');
        return $location.path('/');
    };

});
