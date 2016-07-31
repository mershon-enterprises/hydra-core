'use strict';

//Login Controller

//Handles login of the user and determines if the user is allowed to access
//any page they visit.
angular.module('webServiceApp').controller('LoginCtrl',
 function ($scope, $rootScope, $location, EVENTS, RestService, NotificationService, localStorageService, Session) {

    // Determine which authenticator UI to use based on back-end support
    RestService.getAuthenticator().then(
        function(success) {
            $rootScope.authenticator = success[1];

            if ($scope.authenticator.name == 'persona') {
                navigator.id.watch({
                  loggedInUser: (Session.exists() ? Session.email : null),
                  onlogin: function(assertion) {
                    $scope.login({
                      email:    "mozilla@persona",
                      password: assertion
                    });
                  },
                  onlogout: function() {
                    Session.destroy();
                  }
                });
            } else if ($scope.authenticator.name == 'firebase') {
                // Initialize Firebase
                var config = {
                    apiKey: $scope.authenticator['firebase-key'],
                    authDomain: $scope.authenticator['firebase-domain']
                };
                firebase.initializeApp(config);

                // FirebaseUI config.
                var uiConfig = {
                    'signInSuccessUrl': window.location.href,
                    'signInOptions': [
                        // Leave the lines as is for the providers you want to offer your users.
                        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                        // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                        // firebase.auth.GithubAuthProvider.PROVIDER_ID,
                        firebase.auth.EmailAuthProvider.PROVIDER_ID
                    ],
                    // Terms of service url.
                    'tosUrl': window.location.href + '/#/manual'
                };

                // Initialize the FirebaseUI Widget using Firebase.
                var ui = new firebaseui.auth.AuthUI(firebase.auth());

                // The start method will wait until the DOM is loaded.
                ui.start('#firebaseui-auth-container', uiConfig);

                firebase.auth().onAuthStateChanged(function(currentUser) {
                    if (currentUser) {
                        $scope.login({
                          email:    currentUser.email,
                          password: currentUser.getToken()
                        });
                    } else {
                        Session.destroy();
                    }
                });
            } else if (Session.exists()) {
                // If they are at the login route and already have a valid
                // session, send them to where they need to be.
                $location.path('/attachment_explorer');
            }
        },
        function() {
            console.log('Authenticator component promise error.');
        }
    );

    //Will be populated by user on login view.
    $scope.credentials = {
        email: '',
        password: ''
    };

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
