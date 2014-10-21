'use strict';

angular.module('webServiceApp').controller('ClientsCtrl', function
  ($rootScope, $scope, $window, $timeout, EVENTS, RestService, NotificationService, Session) {

    var self = this;

    $scope.tableData = [];

    $scope.gridOptions = { data: 'tableData' };

    if (Session.exists()) {

        var self = this;
        $scope.tableData = [];

        //Listener for a successful clients retrieval.
        $scope.$on(EVENTS.clientsRetrieved, function() {
            self.clients = $rootScope.listClientsBuffer;

            $.each(self.clients, function(i, item) {
                $scope.tableData.push({title: item});
            });

            //TODO : This piece of code is required to call a resize event on the
            //browser and force the datatables to redraw in the view. It is a
            //hack. Replace it.
            var w = angular.element($window);
            $timeout(function(){ w.triggerHandler('resize') });
        });

            RestService.listClients();
        }
});
