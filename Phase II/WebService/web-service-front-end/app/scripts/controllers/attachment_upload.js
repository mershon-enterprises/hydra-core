'use strict';

//Upload Controller

//Collects all required data from the user to be submitted to the Restclient.
//Performs client-side verification of input and extraction of file properties
//from attachments.
angular.module('webServiceApp').controller('AttachmentUploadCtrl', function ($scope, $location, Session) {

    //If the user is logged in...
    if (Session.exists()) {

        $scope.back = function () {
            $location.path('/datasets');
        };

        $scope.createdBy = Session.getEmail();
        $scope.dateCreated = Date.now();

        $scope.upload = function () {
            //File attachment logic.
        };

        $scope.save = function () {
            //Restservice call.
        };

    }

});
