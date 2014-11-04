'use strict';

angular.module('webServiceApp').controller('DatasetsCtrl', function ($scope, RestService, Session) {

    if (Session.exists()) {

        //If any of ng-grid's options are declared seperately like this, it's
        //so we can set up listeners on these specific options or expect them
        //to change like variables.
        $scope.filterOptions = {
            filterText: "",
            useExternalFilter: false
        };

        $scope.totalServerItems = 0;

        $scope.pagingOptions = {
            pageSizes: [25, 50, 100],
            pageSize: 25,
            currentPage: 1
        };

        //Options for ng-grid
        //API : https://angular-ui.github.io/ng-grid/
        $scope.gridOptions = {
            data: 'data',
            sortInfo : { fields: ['date_created'], directions: ['desc'] },
            enablePaging: true,
            showFooter: true,
            showColumnMenu: true,
            showFilter: true,
            totalServerItems: 'totalServerItems',
            pagingOptions: $scope.pagingOptions,
            filterOptions: $scope.filterOptions,
            columnDefs: [
                {field: 'filename', displayName: 'Filename'},
                {field: 'bytes', displayName: 'Filesize'},
                {field: 'client_name', displayName: 'Client'},
                {field: 'field_name', displayName: 'Field'},
                {field: 'well_name', displayName: 'Well'},
                {field: 'trailer_number', displayName: 'Trailer'},
                {field: 'created_by', displayName: 'Author'},
                {field: 'date_created', displayName: 'Creation Date'}
            ]
        };

        //Retrieves data from the cache and then slices it to the requested pagination settings.
        $scope.getPagedData = function (pageSize, page) {
            var data = RestService.getCacheValue('data');
            var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
            $scope.data = pagedData;
            $scope.totalServerItems = data.length;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        //Gets the data for the table for the initial page load.
        $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

        //Watchers for when options of ng-grid are change by the user.
        $scope.$watch('pagingOptions', function (newVal, oldVal) {
            $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        }, true);

        $scope.$watch('filterOptions', function (newVal, oldVal) {
            $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        }, true);

    }

});



