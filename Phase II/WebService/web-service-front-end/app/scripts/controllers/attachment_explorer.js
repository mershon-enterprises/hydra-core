'use strict';

//Attachment Explorer Controller

//Handles the display of dataset attachment data from the restclient in a
//tabular interface for the user. Provides custom controls to be performed
//by the user on the attachments in a 'file browser' format.
angular.module('webServiceApp').controller('AttachmentExplorerCtrl', function ($rootScope, $scope, RestService, Session, EVENTS) {

    //If the user is logged in...
    if (Session.exists()) {

        $scope.data = null;

        $scope.searchParams = {
            search_string: '',
            limit: 25,
            offset: 0,
            order_by: 'date_created',
            order: 'desc'
        };

        $scope.clientCollapseOptions = {};
        $scope.locationCollapseOptions = {};

        $(document).on('click', '.toggle', function() {

            var toggle = null;
            var clientName = null;
            var locationName = null;

            if($(this).attr('client')) {
                toggle = $(this);
                clientName = $(this).attr('client');
                $('.location-table').each(function() {
                    if ($(this).attr('parent-client') === clientName) {
                        if ($scope.clientCollapseOptions[clientName]) {
                            $(this).show();
                            toggle.removeClass('fa-plus-square').addClass('fa-minus-square');
                        }
                        else {
                            $(this).hide();
                            toggle.removeClass('fa-minus-square').addClass('fa-plus-square');
                        }
                    }
                });
                $scope.clientCollapseOptions[clientName] = !$scope.clientCollapseOptions[clientName];
            }

            if($(this).attr('location')) {
                toggle = $(this);
                clientName = $(this).attr('parent-client');
                locationName = $(this).attr('location');
                $('.data-row').each(function() {
                    if (($(this).attr('parent-client') === clientName) && ($(this).attr('location') === locationName)) {
                        if ($scope.locationCollapseOptions[clientName+locationName]) {
                            $(this).show();
                            toggle.removeClass('fa-plus-square').addClass('fa-minus-square');
                        }
                        else {
                            $(this).hide();
                            toggle.removeClass('fa-minus-square').addClass('fa-plus-square');
                        }
                    }
                });
                $scope.locationCollapseOptions[clientName+locationName] = !$scope.locationCollapseOptions[clientName+locationName];
            }
        });

        $(document).on('click', '.file-explorer-header * th', function() {
            if ($scope.searchParams.order_by === $(this).attr('key')) {
                if ($scope.searchParams.order === 'desc') {
                    $scope.searchParams.order = 'asc';
                }
                else {
                    $scope.searchParams.order = 'desc';
                }
            }
            else {
                $scope.searchParams.order_by = $(this).attr('key');
                $scope.searchParams.order = 'desc';
            }
            $scope.$apply();
        });

        $(document).on('click', '.pages > li', function() {
            $scope.searchParams.limit = parseInt($(this).html());
            $scope.$apply();
        });

        $(document).on('click', '.navigation > li', function() {

            if ($(this).children().hasClass('fa-angle-double-left')) {
                $scope.searchParams.offset = 0;
            }
            else if ($(this).children().hasClass('fa-angle-left')) {
                if ($scope.searchParams.offset - $scope.searchParams.limit >= 0) {
                    $scope.searchParams.offset = $scope.searchParams.offset - $scope.searchParams.limit;
                }
            }
            else if ($(this).children().hasClass('fa-angle-right')) {
                //TODO. Implement maximum.
                $scope.searchParams.offset = $scope.searchParams.offset + $scope.searchParams.limit;
            }
            else if ($(this).children().hasClass('fa-angle-double-right')) {
                //TODO. Not implemented.
            }

            $scope.$apply();
        });

        //Bindings for the controls in each row.
        $(document).on('click', '.fa-download', function(){
            RestService.getAttachmentURL($(this).attr('ukey')).then(
            function(success){
                if(success[0] === EVENTS.promiseSuccess) {
                window.location.href = success[1];
            }
            },
            function(error){
                console.log('AttachmentExplorerCtrl promise error.');
                console.log(error);
            });
        });

        $(document).on('click', '.fa-cog', function(){
            $rootScope.ukey = $(this).attr('ukey');
            window.location.href = '#/attachment_details';
        });

        //Retrieve data from the restservice, with query parameters specified
        //in $scope.searchParams.
        $scope.getData = function () {
            RestService.listAttachments($scope.searchParams).then(
            function (success) {
                if (success[0] === EVENTS.promiseSuccess) {
                    $scope.data = success[1];
                    $scope.sortData();
                }
            },
            function (error) {
                console.log('AttachmentExplorerCtrl promise error.');
                console.log(error);
            });
        };

        //Sort the data into containers based on client/field combinations.
        $scope.sortData = function () {
            var clientGroups = {};
            var clientName = null;
            var locationName = null;

            if ($scope.data) {
                $.each($scope.data, function(index, value) {
                    if ('client' in value) {

                        clientName = value.client;
                        $scope.clientCollapseOptions[clientName] = false;

                        if(!(clientName in clientGroups)) {
                            clientGroups[clientName] = {};
                        }

                        if('location' in value) {
                            locationName = value.location;
                            clientGroups[clientName][locationName] = [];
                            $scope.locationCollapseOptions[clientName+locationName] = false;
                        }
                        else {
                            clientGroups[clientName]['noLocation'] = [];
                        }
                    }
                    else {
                        clientGroups['noClient'] = [];
                    }
                });

                $.each($scope.data, function(index, value) {
                    if (('client' in value) && ('location' in value)) {
                        clientName = value.client;
                        locationName = value.location;
                        clientGroups[clientName][locationName].push(value);
                    }
                    else if (('client' in value) && !('location' in value)) {
                        clientName = value.client;
                        clientGroups[clientName]['noLocation'].push(value);
                    }
                    else if (!('client' in value)) {
                        clientGroups['noClient'].push(value);
                    }
                });
            }

            console.log(clientGroups);
            $scope.data = clientGroups;
            RestService.updateCacheValue('data', $scope.data);
        };

        $scope.updateColumnHeaders = function () {
            $scope.filename_show = false;
            $scope.bytes_show = false;
            $scope.created_by_show = false;
            $scope.date_created_show  = false;
            $scope.filename_asc = false;
            $scope.bytes_asc = false;
            $scope.created_by_asc = false;
            $scope.date_created_asc = false;

            if ($scope.searchParams.order_by === 'filename') {
                $scope.filename_show = true;
                if ($scope.searchParams.order === 'asc') {
                    $scope.filename_asc = true;
                }
            }
            else if ($scope.searchParams.order_by === 'bytes') {
                $scope.bytes_show = true;
                if ($scope.searchParams.order === 'asc') {
                    $scope.bytes_asc = true;
                }
            }
            else if ($scope.searchParams.order_by === 'created_by') {
                $scope.created_by_show = true;
                if ($scope.searchParams.order === 'asc') {
                    $scope.created_by_asc = true;
                }
            }
            else if ($scope.searchParams.order_by === 'date_created') {
                $scope.date_created_show = true;
                if ($scope.searchParams.order === 'asc') {
                    $scope.date_created_asc = true;
                }
            }
        };

        $scope.$watch('searchParams', function(newValue, oldValue) {
            if (newValue === oldValue) { return; }
            $scope.getData();
            $scope.updateColumnHeaders();
        }, true);

        $scope.$on(EVENTS.newSearch, function(event, args) {
            $scope.searchParams.search_string = args;
            $scope.$apply();
        });

        $scope.$on(EVENTS.cacheReady, function() {
            $scope.getData();
            $scope.updateColumnHeaders();
        });

        if (RestService.getCacheValue('data') !== null) {
            $scope.data = RestService.getCacheValue('data');
        }

    }

});
