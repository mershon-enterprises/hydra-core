'use strict';

angular.module('webServiceApp').controller('UsersCtrl', function ($rootScope, $scope, $window, $timeout, EVENTS, RestService, NotificationService, Session) {

    if (Session.exists()) {

        var self = this;

        $scope.tableDataLA = [];
        $scope.tableDataLU = [];

        //Listener for a successful accessLevels retrieval.
        $scope.$on(EVENTS.accessLevelsRetrieved, function() {
          self.accessLevels = $rootScope.accessLevelsBuffer;

          $.each(self.accessLevels, function(i, item) {
            $scope.tableDataLA.push({title: item});
          });

          //TODO : This piece of code is required to call a resize event on the
          //browser and force the datatables to redraw in the view. It is a
          //hack. Replace it.
          var w = angular.element($window);
          $timeout(function(){ w.triggerHandler('resize') });
        });


        //Listener for a successful accessLevels retrieval.
        $scope.$on(EVENTS.usersRetrieved, function() {
          self.users = $rootScope.listUsersBuffer;

          $.each(self.users, function(i, item) {
            $scope.tableDataLU.push({title: item});
          });

          //TODO : This piece of code is required to call a resize event on the
          //browser and force the datatables to redraw in the view. It is a
          //hack. Replace it.
          var w = angular.element($window);
          $timeout(function(){ w.triggerHandler('resize') });
        });

        RestService.listAccessLevels();
        RestService.listUsers();
    }
    else {
      //If the routeProvider code is working, this should never fire.
      NotificationService.warning("No session found!", "User is not logged in.");
      console.log("User was able to access route without session!");
    }

    $scope.gridOptionsLA = { data: 'tableDataLA' };
    $scope.gridOptionsLU = { data: 'tableDataLU' };

});
