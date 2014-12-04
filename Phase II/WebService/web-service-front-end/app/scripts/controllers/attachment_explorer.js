'use strict';

//Attachment Explorer Controller

//Handles the display of dataset attachment data from the restclient in a
//tabular interface for the user. Provides custom controls to be performed
//by the user on the attachments in a 'file browser' format.
angular.module('webServiceApp').controller('AttachmentExplorerCtrl', function ($rootScope, $scope, RestService, Session, EVENTS) {

    //If the user is logged in...
    if (Session.exists()) {

        $scope.data = null;

        $scope.paramsMap = {
            stringQuery: '',
            order: 'desc',
            offset: '',
            limit: '',
            order_by: 'data_created'
        };

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
                    console.log($scope.data);
                }
            },
            function (error) {
                console.log('AttachmentExplorerCtrl promise error.');
                console.log(error);
            });

            //Sort the data.
            $scope.sortData();
        };

        //Sort the data into containers based on client/field combinations.
        $scope.sortData = function () {
            if ($scope.data) {
                $.each($scope.data, function(index, value) {

                });
            }
        };

        $scope.$on(EVENTS.cacheReady, function() {
            $scope.getData();
        });

    }

});
