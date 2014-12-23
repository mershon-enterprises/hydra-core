'use strict';

//Attachment Explorer Controller

//Handles the display of dataset attachment data from the restclient in a
//tabular interface for the user. Provides custom controls to be performed
//by the user on the attachments in a 'file browser' format.
angular.module('webServiceApp').controller('AttachmentExplorerCtrl', function ($rootScope, $scope, RestService, Session, EVENTS) {

    //If the user is logged in...
    if (Session.exists()) {

        $scope.data = null;
        $scope.resultCount = 0;
        $scope.resultCountLabel = '';
        $scope.clientCollapseOptions = {};
        $scope.locationCollapseOptions = {};
        $scope.currentPage = 0;
        $scope.paginationPages = [];

        $scope.searchParams = {
            search_string: '',
            limit: 25,
            offset: 0,
            order_by: 'date_created',
            order: 'desc'
        };

        $(document).on('click', '.data-cell', function() {
            $(this).parent('tr').find('.fa-cog').click();
        });

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
            if($(this).html() === 'Reset') {
                $scope.searchParams = {
                    search_string: '',
                    limit: 25,
                    offset: 0,
                    order_by: 'date_created',
                    order: 'desc'
                };
                $('input.search').val('');
            }
            else {
                $scope.searchParams.limit = parseInt($(this).html());
                $scope.searchParams.limit = parseInt($(this).html());
            }
            $scope.currentPage = 1;
            $scope.$apply();
        });

        $(document).on('click', '.navigation-arrow', function() {
            if ($(this).children().hasClass('fa-angle-double-left')) {
                $scope.searchParams.offset = 0;
            }
            else if ($(this).children().hasClass('fa-angle-left')) {
                if ($scope.searchParams.offset - $scope.searchParams.limit >= 0) {
                    $scope.searchParams.offset = $scope.searchParams.offset - $scope.searchParams.limit;
                }
            }
            else if ($(this).children().hasClass('fa-angle-right')) {

                if ($scope.searchParams.offset + $scope.searchParams.limit < $scope.resultCount) {
                    $scope.searchParams.offset = $scope.searchParams.offset + $scope.searchParams.limit;
                }
            }
            else if ($(this).children().hasClass('fa-angle-double-right')) {
                $scope.searchParams.offset = $scope.resultCount - $scope.searchParams.limit;
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
            NProgress.start();
            NProgress.inc();
            RestService.listAttachments($scope.searchParams).then(
            function (success) {
                NProgress.set(0.75);
                if (success[0] === EVENTS.promiseSuccess) {
                    $scope.data = success[1];
                    $scope.resultCount = success[2];

                    //Calculate the page numbers for the pagination dropdown.
                    var temp = $scope.resultCount;
                    var i = 1;
                    $scope.paginationPages = [];
                    while(temp > 0) {
                        $scope.paginationPages.push(i);
                        temp = temp - $scope.searchParams.limit;
                        i = i+1;
                    }

                    $scope.resultCountLabel =
                        'Showing ' +
                        ($scope.searchParams.offset + 1) +
                        ' - ' +
                        Math.min(
                            ($scope.searchParams.offset +
                             $scope.searchParams.limit),
                            $scope.resultCount) +
                        ' of ' + $scope.resultCount + ' Results';
                    $scope.sortData();
                }
                NProgress.done();
            },
            function (error) {
                console.log('AttachmentExplorerCtrl promise error.');
                console.log(error);
                NProgress.set(0.0);
            });
        };

        //Sort the data into containers based on client/field combinations.
        $scope.sortData = function () {
            var groups = {};
            groups.clients = {};
            groups.noClient = [];
            var clientName = null;
            var locationName = null;

            if ($scope.data) {
                $.each($scope.data, function(index, value) {
                    if (value.client) {

                        clientName = value.client;
                        $scope.clientCollapseOptions[clientName] = false;

                        if(!(clientName in groups.clients)) {
                            groups.clients[clientName] = {};
                        }
                        if(value.location) {
                            locationName = value.location;
                            groups.clients[clientName][locationName] = [];
                            $scope.locationCollapseOptions[clientName+locationName] = false;
                        }
                        else {
                            groups.clients[clientName] = [];
                        }
                    }
                });

                $.each($scope.data, function(index, value) {
                    if ((value.client) && (value.location)) {
                        clientName = value.client;
                        locationName = value.location;
                        groups.clients[clientName][locationName].push(value);
                    }
                    else if ((value.client) && !(value.location)) {
                        clientName = value.client;
                        groups.clients[clientName]['No Location'].push(value);
                    }
                    else if (!(value.client)) {
                        groups.noClient.push(value);
                    }
                });
            }

            $scope.data = groups;
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

        $scope.$watch('currentPage', function(newValue, oldValue) {
            if (newValue === oldValue) { return; }
            $scope.searchParams.offset = $scope.searchParams.limit * ($scope.currentPage - 1);
        }, true);

        $scope.$on(EVENTS.newSearch, function(event, args) {
            $scope.searchParams.search_string = args;
            $scope.$apply();
        });

        //If the cache is ready, force a reload of the page and
        //mark that the cache is ready for future reloads.
        $scope.$on(EVENTS.cacheReady, function() {
            $scope.getData();
            $scope.updateColumnHeaders();
        });

        //Whenever the page is loaded or refreshed, check if the cache
        //is ready and populate the page if it is. This eliminates race
        //conditions with the api-token that could put the app into an
        //unusuable state.
        if(RestService.getCacheValue('cacheReady')) {
            $scope.getData();
            $scope.updateColumnHeaders();
        }

    }

});
