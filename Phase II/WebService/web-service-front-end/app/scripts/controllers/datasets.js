'use strict';

angular.module('webServiceApp').controller('DatasetsCtrl', function ($rootScope, $scope, $filter, $window, $timeout, ngTableParams, RestService, Session) {

    if (Session.exists()) {

        //Retrieve dataset data from the cache.
        var data = RestService.getCacheValue('data');

        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 10,
            sorting: {
                date_created: 'desc'
            }
        },
        {
            total: data.length,
            getData: function($defer, params) {
                // use build-in angular filter
                var orderedData = params.sorting() ?
                                    $filter('orderBy')(data, params.orderBy()) :
                                    data;

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

    }

});



