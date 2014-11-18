'use strict';

//Data Controller

//Ensures that the application has data to work with by invoking the
//RestService. Blocks user input until data is ready. Broadcasts when data is
//ready for use so the application can reload its views.
angular.module('webServiceApp').controller('data', function ($rootScope, $scope, $interval, Session, RestService, EVENTS) {

    //Wipes the cache and then runs checkForData, which will discover the
    //cache is empty and refresh it.
    $scope.refreshData = function () {
        if (Session.exists()) {
            RestService.destroyCache();
            RestService.createCache();
            $scope.checkForData();
        }
    };

    $scope.checkForData = function () {
        if (Session.exists()) {

            //Block user input with the loading modal.
            $scope.modalShow = true;

            //Ask the restservice if the cache is ready. It returns a promise
            //due to the rest service making api calls if it discovers it
            //isn't ready.
            RestService.cacheExists().then(function (success) {
                if(success){
                    $scope.modalShow = false;
                    //broadcast to any listeners that the cache is populated
                    //prompts refresh of table data.
                    $rootScope.$broadcast(EVENTS.cacheReady);
                    //stop checking every second for new data.
                    $interval.cancel($scope.reload);
                }
            },
            function (error) {
                console.log('Cache could not be restored.');
                console.log(error);
            });
        }
    };

    //Check is the cache is empty every second. Will only be active once the
    //controller comes into scope. Ex. page refresh...
    $scope.reload = $interval(function () {
        $scope.checkForData();
    }, 1000);

    //Listener for a request to refresh the cache.
    $scope.$on(EVENTS.cacheRefresh, function() {
        $scope.refreshData();
    });

});
