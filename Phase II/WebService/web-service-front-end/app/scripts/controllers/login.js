'use strict';

//Login Controller

//Handles login of the user and determines if the user is allowed to access
//any page they visit.
angular.module('webServiceApp').controller('LoginCtrl',
 function ($scope, $rootScope, $location, EVENTS, RestService, NotificationService, localStorageService, Session) {

    //If they are at the login route and already have a valid session, send them
    //to where they need to be.
    if(Session.exists()) {
        $location.path('/datasets');
    }

    //Will be populated by user on login view.
    $scope.credentials = {
        email: '',
        password: ''
    };

    //Call RestService with given credentials.
    $scope.login = function (credentials) {
        RestService.authenticate(credentials).then(
        function(success) {
            $rootScope.$broadcast(EVENTS.loginSuccess);
            NotificationService.loginSuccess('Authentication Successful!', 'Welcome ' + Session.firstName + '!');
            $location.path('/datasets');
        },
        function(error) {
            $rootScope.$broadcast(EVENTS.loginFailed);
            NotificationService.loginFailed('Authentication Failure...', 'Please check your credentials.');
            Session.destroy();
        });
    };

    //Listens for route changes. If someone is not logged in and where they
    //are going required login, redirect to root route. (Login)
    $rootScope.$on('$routeChangeStart', function(event, next) {

        //Check on every route change if the clientUUID is present. If it's
        //missing, reset it.
        RestService.updateClientUUID();

        //If the route you are going is marked as loggedInOnly and you are not
        //logged in...
        if (next.loggedInOnly && !Session.exists()) {
            //Back to the root route you go.
            return $location.path('/').replace();
        }
    });

});

