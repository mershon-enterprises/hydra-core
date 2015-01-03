'use strict';

//Attachment Explorer Controller

//Handles the display of dataset attachment data from the restclient in a
//tabular interface for the user. Provides custom controls to be performed
//on those files.
angular.module('webServiceApp').controller('AttachmentExplorerCtrl',
    function (
        $rootScope,
        $scope,
        NotificationService,
        RestService,
        Session,
        EVENTS
    ){

    $rootScope.controller = 'AttachmentExplorer';

    //If the user is logged in...
    if (Session.exists()) {

        //Storage variables for the file this controller is operating on.
        $scope.data = null;
        $scope.resultCount = 0;
        $scope.resultCountLabel = '';
        $scope.clientCollapseOptions = {};
        $scope.locationCollapseOptions = {};
        $scope.currentPage = 0;
        $scope.paginationPages = [];

        //Store the parameters for custom backend calls.
        $scope.searchParams = {
            search_string: '',
            limit: 25,
            offset: 0,
            order_by: 'date_created',
            order: 'desc'
        };

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

        //If someone clicks on a pagination button...
        $(document).on('click', '.pages > li', function() {
            //If it was the reset button, set the search params to a default
            //value and clear the search box.
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
            //Otherwise, parse the value of the button as a search parameter.
            else {
                $scope.searchParams.limit = parseInt($(this).html());
                $scope.searchParams.limit = parseInt($(this).html());
            }

            $scope.currentPage = 1;
            $scope.$apply();
        });

        //Figure out which arrow it was, and alter the "offset" for
        //query. This alters the 'starting row' for the returned set of
        //data. "Limit" is the range of values we want, starting from the
        //offset. Ex Limit = 25, Offset = 25 -> Rows 26-50
        $(document).on('click', '.navigation-arrow', function() {

            var lastPage = $scope.paginationPages.slice(-1)[0];

            if ($(this).children().hasClass('fa-angle-double-left')) {
                $scope.currentPage = 1;
            }
            else if ($(this).children().hasClass('fa-angle-left')) {
                if (($scope.currentPage - 1) > 0) {
                    $scope.currentPage = $scope.currentPage - 1;
                }
            }
            else if ($(this).children().hasClass('fa-angle-right')) {
                if (($scope.currentPage + 1) <= lastPage){
                    $scope.currentPage = $scope.currentPage + 1;
                }
            }
            else if ($(this).children().hasClass('fa-angle-double-right')) {
                $scope.currentPage = lastPage;
            }

            //Force UI Update.
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

            //First, we set up the data structure dynamically based on what
            //clients and locations are present in the data.
            if ($scope.data) {
                //For every row of data...
                $.each($scope.data, function(index, value) {
                    //If it has a client key...
                    if (value.client) {
                        //Harvest that client.
                        clientName = value.client;
                        //Remember the client's name for collapsing options
                        //later.
                        $scope.clientCollapseOptions[clientName] = false;

                        //If the client hasn't been seen before...
                        if(!(clientName in groups.clients)) {
                            //Create a collection for them.
                            groups.clients[clientName] = {};
                        }
                        //If there is a location key...
                        if(value.location) {
                            //Harvest that location.
                            locationName = value.location;
                            //Create a collection for the client+location pair.
                            groups.clients[clientName][locationName] = [];
                            $scope.locationCollapseOptions[clientName+
                                                        locationName] = false;
                        }
                        else {
                            //Since a row can have a client, but no location,
                            //this case is valid and we can still make a
                            //collection for this row.
                            groups.clients[clientName] = [];
                        }
                    }
                });

                //Second, we traverse over the data again and place the rows in
                //the correct locations.
                $.each($scope.data, function(index, value) {
                    //If the row has a client and location...
                    if ((value.client) && (value.location)) {
                        //Harvest them.
                        clientName = value.client;
                        locationName = value.location;
                        //Push the row into the right collection.
                        groups.clients[clientName][locationName].push(value);
                    }
                    //If they have a client but no location...
                    else if ((value.client) && !(value.location)) {
                        //Harvest the client.
                        clientName = value.client;
                        //Sort under special "No Location" location.
                        groups.clients[clientName]['No Location'].push(value);
                    }
                    //If they have no client (and implicitly no location...)
                    else if (!(value.client)) {
                        //Sort into special "noClient" client.
                        groups.noClient.push(value);
                    }
                });
            }

            //Data has been sorted.
            $scope.data = groups;
            //Update the cache.
            RestService.updateCacheValue('data', $scope.data);
        };

        //Update the up and down arrows that indicate sort direction based
        //what the searchParameters currently are.
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
