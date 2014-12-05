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
            limit: 20,
            offset: 0,
            order_by: 'date_created',
            order: 'desc'
        };

        $scope.collapseOptions = {};
        $scope.client = {};

        $(document).on('click', '.fa-plus-square', function() {
            $scope.client = $(this).attr('client');
            $('.file-explorer-table').each(function() {
                if ($(this).attr('client') === $scope.client) {
                    if ($scope.collapseOptions[$scope.client]) {
                        $(this).find('td').show();
                    }
                    else {
                        $(this).find('td').hide();
                    }
                    $scope.collapseOptions[$scope.client] = !$scope.collapseOptions[$scope.client];
                }
            });
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
            var tempObject = {};

            $.extend(clientGroups, {'nonClient': []});
            if ($scope.data) {
                $.each($scope.data, function(index, value) {
                    if ('client' in value) {
                        clientName = value.client;
                        if (clientName in clientGroups) {
                            clientGroups[clientName].push(value);
                        }
                        else {
                            tempObject[clientName] = [];
                            $.extend(clientGroups, tempObject);
                            clientGroups[clientName].push(value);
                            tempObject = {};
                        }
                    }
                    else {
                        clientGroups['nonClient'].push(value);
                    }
                    $scope.collapseOptions[clientName] = false;
                });
            }
            $scope.data = clientGroups;
            RestService.updateCacheValue('data', $scope.data);
        };

        $scope.$watch('searchParams', function(newValue, oldValue) {
            if (newValue === oldValue) { return; }
            $scope.getData();
        }, true);

        $scope.$on(EVENTS.newSearch, function(event, args) {
            $scope.searchParams.search_string = args;
            $scope.$apply();
        });

        $scope.$on(EVENTS.cacheReady, function() {
            $scope.getData();
        });

        if (RestService.getCacheValue('data') !== null) {
            $scope.data = RestService.getCacheValue('data');
        }

    }

});
