'use strict';

angular.module('webServiceApp').controller('DatasetsCtrl', function ($rootScope, $scope, $window, $timeout, EVENTS, RestService, NotificationService, Session) {
       if (Session.exists()) {

        var self = this;

        $scope.tableData = [];

        $scope.gridOptions = { data: 'tableData' };

        //Listener for a successful accessLevels retrieval.
        $scope.$on(EVENTS.dataRetrieved, function() {

            self.datasets = $rootScope.listDatasetsWithAttachmentsBuffer;

            var creationDate = null;
            var attachments = [];

            $.each(self.datasets, function(i, item) {

                creationDate = item.date_created;
                attachments = [];

                $.each(item.data_set_attachments, function(i, dataItem) {

                    attachments.push({
                        filename : dataItem.filename,
                        fileSize : dataItem.bytes
                    })

                });

                console.log(attachments);

                $.each(attachments, function(i, attachment) {

                    $scope.tableData.push($.extend({Date_Created: creationDate} , attachment));

                });

            });

              //TODO : This piece of code is required to call a resize event on the
              //browser and force the datatables to redraw in the view. It is a
              //hack. Replace it.
              var w = angular.element($window);
              $timeout(function(){ w.triggerHandler('resize'); });
        });

        RestService.listDatasetsWithAttachments();
    }

});
