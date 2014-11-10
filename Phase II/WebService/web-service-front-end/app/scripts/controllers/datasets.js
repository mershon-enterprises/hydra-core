'use strict';

angular.module('webServiceApp').controller('DatasetsCtrl', function ($rootScope, $scope, RestService, EVENTS, Session) {

    if (Session.exists()) {

        //jQuery click behavior bindings for ngGrid file controls.
        $(document).on("click", ".fa-download", function(){
            //Do download behavior.
        });

        $(document).on("click", ".fa-cog", function(){
            $scope.toggleProperties($(this).attr("uuid"));
        });


        $scope.showProperties = false;
        $scope.uuid = null;

        $scope.toggleProperties = function(uuid) {
            $scope.showProperties = !$scope.showProperties;
            $scope.uuid = uuid;

            //Do file properties behavior.

            //Ensure the scope applies after we make a change.
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        $scope.renameFile = function() {

            //Do rename behavior.
            console.log("Rename clicked! UUID: " + $scope.uuid);

        };

        $scope.deleteFile = function() {

            //Do delete behavior.
            console.log("Delete clicked! UUID: " + $scope.uuid);

        };

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
            //showColumnMenu: true,
            //showFilter: true,
            enableRowSelection : false,
            groups: ['client', 'field_name'],
            groupsCollapsedByDefault: false,
            columnDefs: [
                {field: 'filename', displayName: 'Filename'},
                {field: 'bytes', displayName: 'Filesize', cellTemplate: '/templates/ng-grid-templates/filesize.html', width: 100},
                {field: 'client', displayName: 'Client'},
                {field: 'field_name', displayName: 'Field'},
                {field: 'well_name', displayName: 'Well'},
                {field: 'trailer_number', displayName: 'Trailer'},
                {field: 'created_by', displayName: 'Author', cellTemplate: '/templates/ng-grid-templates/author.html', width: 250},
                {field: 'date_created', displayName: 'Creation Date', cellTemplate: '/templates/ng-grid-templates/date.html'},
                {field: 'uuid', displayName: '', cellTemplate: '/templates/ng-grid-templates/controls.html', width: 50}
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

            if (data != null) {

                //Filter the data.
                var filteredData = [];
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
            }

            //Ensure the scope applies after we make a change.
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        //Watchers for when options of ng-grid are change by the user.
        $scope.$watch('pagingOptions', function () {
            $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $rootScope.filterText);
        }, true);

        $rootScope.$watch('filterText', function () {
            $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $rootScope.filterText);
        }, true);

        $scope.$on(EVENTS.cacheReady, function() {
            $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $rootScope.filterText);
        });

    }

});



4
