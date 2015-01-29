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
        Preferences,
        RestService,
        Session,
        EVENTS
    ){

    $rootScope.controller = 'AttachmentExplorer';

    //If the user is logged in...
    if (Session.exists()) {

        //Bind the search parameters used by this controller to the Preferences
        //service, which will maintain those preferences between controller
        //swaps.
        $scope.searchParams = Preferences.searchParams;

        //Bind the pagination preferences in the same way.
        $scope.paginationParams = Preferences.paginationParams;

        //View variables.
        $scope.data = null;
        $scope.resultCount = 0;
        $scope.resultCountLabel = '';
        $scope.clientCollapseOptions = {};
        $scope.locationCollapseOptions = {};

        //Change pagination options that will change number of items displayed
        //at a time.
        $scope.paginate = function(pageValue) {
            if (pageValue === 'reset') {
                $scope.searchParams = {
                    or_search_strings: [],
                    and_search_strings: [],
                    not_search_strings: [],
                    limit: 25,
                    offset: 0,
                    order_by: 'date_created',
                    order: 'desc'
                };
                $('input.search').val('');
            }
            else {
                $scope.searchParams.limit = pageValue;
            }

            $scope.paginationParams.currentPage = 1;
        };

        //Navigate through the paginated interface.
        $scope.navigate = function(direction) {

            var lastPage = $scope.paginationParams.paginationPages.slice(-1)[0];

            if (direction === 'first') {
                $scope.paginationParams.currentPage = 1;
            }
            else if (direction === 'prev') {
                if (($scope.paginationParams.currentPage - 1) > 0) {
                    $scope.paginationParams.currentPage =
                    $scope.paginationParams.currentPage - 1;
                }
            }
            else if (direction === 'next') {
                if (($scope.paginationParams.currentPage + 1) <= lastPage){
                    $scope.paginationParams.currentPage =
                    $scope.paginationParams.currentPage + 1;
                }
            }
            else if (direction === 'last') {
                $scope.paginationParams.currentPage = lastPage;
            }

            $scope.updateCurrentPage();
        };

        //If the current page is updated, change the data that is displayed to
        //the user.
        $scope.updateCurrentPage = function() {
            $scope.searchParams.offset = $scope.searchParams.limit *
            ($scope.paginationParams.currentPage - 1);
        };

        //Update the displayed item count of the results and repopulate the
        //select box with the new pagination page numbers. If an invalid
        //result is found eg. "Displaying 500-600 of 135 items", reset
        //the current page to 1.
        $scope.updateResultCount = function () {
            //Calculate the page numbers for the pagination dropdown.
            var temp = $scope.resultCount;
            var i = 1;
            $scope.paginationParams.paginationPages = [];
            while(temp > 0) {
                $scope.paginationParams.paginationPages.push(i);
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

        };

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
                    $scope.updateResultCount();
                    $scope.sortData();
                }
                NProgress.done();
                $scope.updateColumnHeaders();
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

        //Update the sort-direction arrows in every column. This functon
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

        //Retrieve new data every time the searchParams updates.
        $scope.$watch('searchParams', function(newValue, oldValue) {
            if (newValue === oldValue) { return; }
            $scope.getData();
        }, true);

        //Update the view every time the user changes the current page.
        //Note, this fires the 'searchParams' watcher to acheieve this.
        $scope.$watch('paginationParams.currentPage', function(newValue, oldValue) {
            if (newValue === oldValue) { return; }
            $scope.updateCurrentPage();
        }, true);

        //If you see a new search event from the navbar directive, update the
        //view with new data. Note, this fires the 'searchParams' watcher to
        //acheieve this.
        $scope.$on(EVENTS.newSearch, function(event, args) {
            $.extend($scope.searchParams, args);
            $scope.$apply();
        });

        //If the cache is ready, force a reload of the page and
        //mark that the cache is ready for future reloads.
        $scope.$on(EVENTS.cacheReady, function() {
            $scope.getData();
        });

        //Whenever the page is loaded or refreshed, check if the cache
        //is ready and populate the page if it is. This eliminates race
        //conditions with the api-token that could put the app into an
        //unusuable state.
        if(RestService.getCacheValue('cacheReady')) {
            $scope.getData();
        }

    }

});
