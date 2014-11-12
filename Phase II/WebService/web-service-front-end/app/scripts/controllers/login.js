'use strict';

//Login Controller

//Handles login of the user and determines if the user is allowed to access
//any page they visit.
angular.module('webServiceApp').controller('LoginCtrl',
 function ($scope, $rootScope, $location, EVENTS, RestService, NotificationService, localStorageService, Session) {

    //Will be populated by user on login view.
    $scope.credentials = {
        email: '',
        password: ''
    };

    //Call RestService with given credentials.
    $scope.login = function (credentials) {
      RestService.authenticate(credentials);
    };

    //Listens for route changes. If someone is not logged in and where they
    //are going required login, redirect to root route. (Login)
    $rootScope.$on('$routeChangeStart', function(event, next) {
        // on application launch, if a client UUID doesn't exist, set one
        if (!localStorageService.get('clientUUID')) {
            localStorageService.set('clientUUID', restclient.uuid());
        }

        //If the route you are going is marked as loggedInOnly and you are not
        //logged in...
        if (next.loggedInOnly && !Session.exists()) {
            //Back to the root route you go.
            $location.replace();
            return $location.path('/');
        }
    });

    //Listener for a successful login.
    $scope.$on(EVENTS.loginSuccess, function() {
        NotificationService.loginSuccess('Authentication Successful!', 'Welcome ' + Session.firstName + '!');
        window.location.href='/#/datasets';
    });

    //Listener for a failed login.
    $scope.$on(EVENTS.loginFailed, function() {
        NotificationService.loginFailed('Authentication Failure...', 'Please check your credentials.');
        Session.destroy();
    });

});

