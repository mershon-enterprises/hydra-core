'use strict';

angular.module('webServiceApp').controller('data', function ($rootScope, $scope, $interval, Session, RestService, EVENTS) {

    $scope.checkForData = function () {

        if (Session.exists()) {

            if (!$rootScope.loading && RestService.cacheExists()) {
                $scope.modalShow = false;
                $rootScope.$broadcast(EVENTS.cacheReady);
                $interval.cancel($scope.reload);
            }
            else {
                $scope.modalShow = true;
            }

        }

     };

    $scope.$on(EVENTS.loginSuccess, function(event, args) {

        if (Session.exists()) {
            $scope.checkForData();
        }

    });

    $scope.reload = $interval(function () {
            if (Session.exists()) {
                console.log("checking for data...");
                $scope.checkForData();
            }
        }, 1000);

});
