'use strict';

//Navbar Directive

//Controls the display of various navigation elements and binds navigation hotkeys.
angular.module('webServiceApp').directive('fileExplorerTable', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/file_explorer_table.html',
        controller: function ($rootScope, $scope, RestService, EVENTS, NotificationService) {

        //Navigate to the attachment details view for the file with the given
        //ukey.
        $scope.viewFileDetails = function(ukey) {
            //Store the ukey for this file into the rootScope so the details
            //controller can use it.
            $rootScope.ukey = ukey;

            //Navigate to that controller.
            window.location.href = '#/attachment_details';
        };

        //Downloads the file for the given ukey.
        $scope.downloadFile = function(ukey) {
            //Call the RestService to get the URL for that file in the
            //backend.
            RestService.getAttachmentURL(ukey).then(
            function(success){
                //If you got it, set the browser to that URL to have the
                //browser start file-download.
                if(success[0] === EVENTS.promiseSuccess) {
                window.location.href = success[1];
            }
            },
            function(){
                NotificationService.error(
                    'Critical Error',
                    'Please contact support.'
                );
            });
        };

        //Sort the column with the given key in descending order. Or swap
        //the sort order if it's already sorted.
        $scope.sortColumn = function(key) {
            //Get the key from the column and check if we are already sorting
            //by that key.
            if ($scope.searchParams.order_by === key) {
                //If the order is desc, use asc.
                if ($scope.searchParams.order === 'desc') {
                    $scope.searchParams.order = 'asc';
                }
                //Otherwise, use desc.
                else {
                    $scope.searchParams.order = 'desc';
                }
            }
            //Otherwise, set the ordering to that key and set it to desc.
            else {
                $scope.searchParams.order_by = key;
                $scope.searchParams.order = 'desc';
            }
        };

        //Toggle all rows that are related to the clientName
        $scope.toggleClient = function(clientName) {
            //For all locations...
            $('.location-table').each(function() {
                //If the location is for the client we found earlier...
                if ($(this).attr('parent-client') === clientName) {
                    //If the section is collapsed, expand it.
                    //If the section is expanded, collapse it.
                    if ($scope.clientCollapseOptions[clientName]) {
                        $(this).show();
                    }
                    else {
                        $(this).hide();
                    }
                }
            });
            //Remember the change we made.
            $scope.clientCollapseOptions[clientName] =
            !$scope.clientCollapseOptions[clientName];
        };

        //Toggle all rows that are of the specified locationName related to the
        //parentClient
        $scope.toggleLocation = function(locationName, parentClient) {
            //For all data rows...
            $('.data-row').each(function() {
                //If this row is related to the client and location...
                if (($(this).attr('parent-client') === parentClient) &&
                    ($(this).attr('location') === locationName))
                {
                    //If the section is collapsed, expand it.
                    //If the section is expanded, collapse it.
                    if ($scope.locationCollapseOptions[parentClient+
                                                            locationName]) {
                        $(this).show();
                    }
                    else {
                        $(this).hide();
                    }
                }
            });
            //Remember the change we made.
            $scope.locationCollapseOptions[parentClient+locationName] =
            !$scope.locationCollapseOptions[parentClient+locationName];
        };

        },
        controllerAs: 'fet'
    };
});
