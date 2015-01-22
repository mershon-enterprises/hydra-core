'use strict';

//Navbar Directive

//Controls the display of various navigation elements and binds navigation hotkeys.
angular.module('webServiceApp').directive('fileExplorerTable', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/file_explorer_table.html',
        controller: function ($rootScope, $scope, RestService, EVENTS, NotificationService) {

        //If anyone clicks on a <td> that has file data in it, take them
        //to the details view by forwarding the click event to the file
        //details button for that row.
        $(document).on('click', '.data-cell', function() {
            $(this).parent('tr').find('.fa-cog').click();
        });

        //If anyone clicks on a + or - in a table header, collapse or expand
        //the section the + or - is related to.
        $(document).on('click', '.toggle', function() {

            var toggle = null;
            var clientName = null;
            var locationName = null;

            //If it's a client header...
            if($(this).attr('client')) {
                //Remember this icon.
                toggle = $(this);
                //Get the client's name.
                clientName = $(this).attr('client');
                //For all locations...
                $('.location-table').each(function() {
                    //If the location is for the client we found earlier...
                    if ($(this).attr('parent-client') === clientName) {
                        //If the section is collapsed, expand it.
                        //If the section is expanded, collapse it.
                        if ($scope.clientCollapseOptions[clientName]) {
                            $(this).show();
                            //And then change the + to -
                            toggle.removeClass('fa-plus-square').addClass(
                                                            'fa-minus-square');
                        }
                        else {
                            $(this).hide();
                            //Or vice-versa.
                            toggle.removeClass('fa-minus-square').addClass(
                                                            'fa-plus-square');
                        }
                    }
                });
                //Remember the change we made.
                $scope.clientCollapseOptions[clientName] =
                !$scope.clientCollapseOptions[clientName];
            }

            //If this a location row...
            if($(this).attr('location')) {
                //Remember this icon.
                toggle = $(this);
                //Get the client's name.
                clientName = $(this).attr('parent-client');
                //Get the location name.
                locationName = $(this).attr('location');
                //For all data rows...
                $('.data-row').each(function() {
                    //If this row is related to the client and location...
                    if (($(this).attr('parent-client') === clientName) &&
                        ($(this).attr('location') === locationName))
                    {
                        //If the section is collapsed, expand it.
                        //If the section is expanded, collapse it.
                        if ($scope.locationCollapseOptions[clientName+
                                                                locationName]) {
                            $(this).show();
                            toggle.removeClass('fa-plus-square').addClass(
                                                            'fa-minus-square');
                        }
                        else {
                            $(this).hide();
                            toggle.removeClass('fa-minus-square').addClass(
                                                            'fa-plus-square');
                        }
                    }
                });
                //Remember the change we made.
                $scope.locationCollapseOptions[clientName+locationName] =
                !$scope.locationCollapseOptions[clientName+locationName];
            }
        });

        //If someone clicks on the column headers, sort the column by desc order
        //if it already is in desc, change it to asc order.
        $(document).on('click', '.file-explorer-header * th', function() {
            //Get the key from the column and check if we are already sorting
            //by that key.
            if ($scope.searchParams.order_by === $(this).attr('key')) {
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
                $scope.searchParams.order_by = $(this).attr('key');
                $scope.searchParams.order = 'desc';
            }
            //Force UI update.
            $scope.$apply();
        });

        //If someone clicks the download button on a row...
        $(document).on('click', '.fa-download', function() {
            //Call the RestService to get the URL for that file in the
            //backend.
            RestService.getAttachmentURL($(this).attr('ukey')).then(
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
        });

        //If someone clicks the properties button on a row...
        $(document).on('click', '.fa-cog', function(){
            //Store the ukey for this file into the rootScope so the details
            //controller can use it.
            $rootScope.ukey = $(this).attr('ukey');
            //Navigate us to that controller.
            window.location.href = '#/attachment_details';
        });

        },
        controllerAs: 'fet'
    };
});
