'use strict';

angular.module('webServiceApp').controller('DatasetsCtrl', function ($rootScope, $scope, $window, $timeout, ngTableParams, RestService, Session) {

    //If the cache is updated, redraw the page by forcing a window-resize
    //event.
    $rootScope.$watch('cache', function() {
        var w = angular.element($window);
        $timeout(function(){ w.triggerHandler('resize'); });
    });

    if (Session.exists()) {

        //Retrieve dataset data from the cache.
        var data = RestService.getCacheValue('data');

        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 10
        },
        {
            total: data.length,
            getData: function($defer, params) {
                $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

    }

});



