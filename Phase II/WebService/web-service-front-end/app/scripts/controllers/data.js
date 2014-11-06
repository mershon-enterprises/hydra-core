'use strict';

angular.module('webServiceApp').controller('data', function ($rootScope, $scope, $interval, Session, RestService, EVENTS) {

    $scope.loading = false;

    $scope.checkForData = function () {

        if (Session.exists()) {

            $scope.loading = true;

            if (RestService.cacheExists()) {
                $scope.modalShow = false;
                $rootScope.$broadcast(EVENTS.cacheReady);
            }
            else {
                $scope.modalShow = true;
            }

            $scope.loading = false;
        }

     };

    $scope.$on(EVENTS.loginSuccess, function(event, args) {

        if (Session.exists()) {
            if(!$scope.loading){
                $scope.checkForData();
            }
        }

        var reload =
        $interval(function () {
            if (Session.exists()) {
                if(!$scope.loading){
                    $scope.checkForData();
                }
            }
        }, 5000);
    });

});
