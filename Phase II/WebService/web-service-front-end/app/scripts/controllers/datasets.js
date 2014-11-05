'use strict';

angular.module('webServiceApp').controller('DatasetsCtrl', function ($rootScope, $scope, RestService, Session) {

    if (Session.exists()) {

        //Options for ng-grid.

        //If any of ng-grid's options are declared seperately like this, it's
        //so we can set up listeners on these specific options or expect them
        //to change like variables.

        $scope.filterOptions = {
            filterText: '',
            useExternalFilter: false
        };

        $scope.totalServerItems = 0;

        $scope.pagingOptions = {
            pageSizes: [25, 50, 100],
            pageSize: 25,
            currentPage: 1
        };

        //API : https://angular-ui.github.io/ng-grid/
        $scope.gridOptions = {
            data: 'data',
            sortInfo : { fields: ['date_created'], directions: ['desc'] },
            enablePaging: true,
            showFooter: true,
            showGroupPanel: true,
            totalServerItems: 'totalServerItems',
            pagingOptions: $scope.pagingOptions,
            filterOptions: $scope.filterOptions,
            showColumnMenu: true,
            showFilter: true,
            columnDefs: [
                {field: 'filename', displayName: 'Filename'},
                {field: 'bytes', displayName: 'Filesize'},
                {field: 'client_name', displayName: 'Client'},
                {field: 'field_name', displayName: 'Field'},
                {field: 'well_name', displayName: 'Well'},
                {field: 'trailer_number', displayName: 'Trailer'},
                {field: 'created_by', displayName: 'Author'},
                {field: 'date_created', displayName: 'Creation Date', cellTemplate: '/templates/ng-grid-templates/date.html'}
            ]
        };

        //Retrieves data from the cache and then slices it to the requested pagination settings.
        $scope.getPagedData = function (pageSize, page, filterText) {

            if (filterText) {
                filterText = filterText.toLowerCase();
            }
            else {
                filterText = '';
            }

            //Get the original data from the cache.
            var data = RestService.getCacheValue('data');

            //Filter the data.
            var filteredData = []
            var rowMatches = false;
            $.each(data, function(rowIndex, row){
                rowMatches = false;
                $.each(row, function(cellIndex, cell) {
                    if (typeof cell === 'string'){
                        if(cell.toLowerCase().indexOf(filterText) > -1){
                            rowMatches = true;
                        }
                    }
                });
                if (rowMatches) {
                    filteredData.push(row);
                }
            });

            //Paginate the data.
            var pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);
            $scope.data = pagedData;
            $scope.totalServerItems = data.length;

            //I have no idea what this is. It's in the example for pagination in their API.
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        //Watchers for when options of ng-grid are change by the user.
        $scope.$watch('pagingOptions', function () {
            $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $rootScope.filterText);
        });

        $rootScope.$watch('filterText', function () {
            $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $rootScope.filterText);
        });

    }

});



