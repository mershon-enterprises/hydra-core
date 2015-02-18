'use strict';

//Login Controller

//Handles login of the user and determines if the user is allowed to access
//any page they visit.
angular.module('webServiceApp').controller('LoginCtrl',
 function ($scope, $rootScope, $location, EVENTS, RestService, NotificationService, localStorageService, Session) {

    //If they are at the login route and already have a valid session, send them
    //to where they need to be.
    if(Session.exists()) {
        $location.path('/attachment_explorer');
    }

    //Will be populated by user on login view.
    $scope.credentials = {
        email: '',
        password: ''
    };

    //Collect the version of the app to be displayed in the UI.
    RestService.version();

    //Call RestService with given credentials.
    $scope.login = function (credentials) {
        NProgress.start();
        RestService.authenticate(credentials).then(
        function(success) {
            if (success[0] === EVENTS.promiseSuccess) {
                $rootScope.$broadcast(EVENTS.loginSuccess);
                NotificationService.loginSuccess('Authentication Successful!', 'Welcome ' + Session.firstName + '!');
                $location.path('/attachment_explorer');
                NProgress.set(0.25);
            }
        },
        function(error) {
            if (error[0] === EVENTS.promiseFailed) {
                NotificationService.error('Critical error.', 'Please contact support.');
            }
            else if (error[0] === EVENTS.badStatus) {
                NotificationService.error('Could not connect to server.', 'Please try again.');
            }
            $rootScope.$broadcast(EVENTS.loginFailed);
            NotificationService.loginFailed('Authentication Failure...', 'Please check your credentials.');
            Session.destroy();
            NProgress.done();
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
