'use strict';

angular.module('webServiceApp').controller('UsersCtrl', function ($scope, RestService, Session) {

    if (Session.exists()) {
      $scope.accessLevels = RestService.listAccessLevels();
    }

});
