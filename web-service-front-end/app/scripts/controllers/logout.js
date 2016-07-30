'use strict';

//Logout Controller

//Wipes all data stored to localstorage by the app, allowing it to return to a
//default state.
angular.module('webServiceApp').controller('LogoutCtrl',
 function ($scope, $rootScope, $location, EVENTS, CacheService, NotificationService, RestService, Session) {

    $scope.logout = function () {
        if ($rootScope.authenticator.name == 'persona') {
            navigator.id.logout();
        } else if ($rootScope.authenticator.name == 'firebase') {
            firebase.auth().signOut();
            Session.destroy();
            window.location.reload();
        } else {
            Session.destroy();
        }
        CacheService.destroyCache();
        $rootScope.$broadcast(EVENTS.logoutSuccess);
        NotificationService.info('Logout Successful', 'Redirecting to home.');
        return $location.path('/');
    };

    $rootScope.$on(EVENTS.logoutAction, function() {
        $scope.logout();
    });

    if(!CacheService.exists()) {
        $scope.logout();
    }

});
