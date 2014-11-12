'use strict';

//Dataset Controller

//Handles the display of dataset attachment data from the restclient in a
//tabular interface for the user. Provides custom controls to be performed
//by the user on the attachments in a 'file browser' format.
angular.module('webServiceApp').controller('DatasetsCtrl', function ($rootScope, $scope, RestService, EVENTS, Session, NotificationService) {

    //If the user is logged in...
    if (Session.exists()) {

        //jQuery click behavior bindings for ngGrid file controls.
        $(document).on('click', '.fa-download', function(){
            //Do download behavior.
        });

        $(document).on('click', '.fa-cog', function(){
            $scope.toggleProperties($(this).attr('ukey'));
        });


        $scope.showProperties = false;
        $scope.ukey = null;
        $scope.newFilename = null;

        //Toggle the modal properties dialog that contains the controls for
        //renaming and deleting that file. While the modal is active, the
        //'unique key' for the row that was selected will be in scope.
        //ukey = 'filename' + '\n' + 'uuid'
        $scope.toggleProperties = function(ukey) {
            $scope.showProperties = !$scope.showProperties;
            $scope.ukey = ukey;

            //Ensure the scope applies after we make a change.
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        //Rename the file whose ukey is in scope.
        $scope.renameFile = function() {

            var re = new RegExp('[a-z_\-\s0-9\.]+\.(txt|csv|pdf|doc|docx|xls|xlsx)$');

            if($scope.newFilename !== '' && $scope.newFilename !== null) {
                if(re.test($scope.newFilename)) {
                    RestService.renameAttachment($scope.ukey, $scope.newFilename);
                    NotificationService.success('Success', 'Attachment Renamed');
                }
                else {
                    NotificationService.error('Invalid filename.', 'Please try again.');
                }
            }
            else {
                NotificationService.error('Could not rename attachment.', 'Filename cannot be blank.');
            }

        };

        //Delet the file from cache and server whose ukey is in scope.
        $scope.deleteFile = function() {

            //TODO Redo as Promise?
            RestService.deleteAttachment($scope.ukey);
            var cacheDeleted = RestService.removeCacheDataValue($scope.ukey);

            if(cacheDeleted) {
                $scope.toggleProperties();
                $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $rootScope.filterText);
                NotificationService.success('Success', 'Attachment Deleted');
            }
            else {
                NotificationService.error('Could not delete attachment.', 'Please try again.');
            }
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
            groups: ['client', 'location'],
            groupsCollapsedByDefault: false,
            columnDefs: [
                {field: 'filename', displayName: 'Filename'},
                {field: 'bytes', displayName: 'Filesize', cellTemplate: '/templates/ng-grid-templates/filesize.html', width: 100},
                {field: 'client', displayName: 'Client'},
                {field: 'location', displayName: 'Location'},
                {field: 'field_name', displayName: 'Field'},
                {field: 'well_name', displayName: 'Well'},
                {field: 'trailer_number', displayName: 'Trailer'},
                {field: 'created_by', displayName: 'Author', cellTemplate: '/templates/ng-grid-templates/author.html', width: 250},
                {field: 'date_created', displayName: 'Creation Date', cellTemplate: '/templates/ng-grid-templates/date.html'},
                {field: 'unique_key', displayName: '', cellTemplate: '/templates/ng-grid-templates/controls.html', width: 50}
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

            if (data !== null) {

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
