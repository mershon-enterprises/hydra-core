'use strict';

//Upload Controller

//Collects all required data from the user to be submitted to the Restclient.
//Performs client-side verification of input and extraction of file properties
//from attachments.
angular.module('webServiceApp').controller('AttachmentUploadCtrl', function ($scope, $location, $upload, Session) {

    //If the user is logged in...
    if (Session.exists()) {

        $scope.filename = '';
        $scope.createdBy = Session.getEmail();
        $scope.dateCreated = Date.now();
        $scope.tags = [];

        $scope.addRow = function(description, value) {
            var duplicateFlag = false;
            $.each($scope.tags, function(index, value) {
                    if (value.description) {
                        if (value.description === description) {
                            duplicateFlag = true;
                        }
                    }
            });
            if (!duplicateFlag) {
                $scope.tags.push({'description' : description, 'value' : value});
            }
        };

        $scope.removeRow = function(description) {
            var newTags = [];
            $.each($scope.tags, function(index, value) {
                    if (value.description) {
                        if (value.description !== description) {
                            newTags.push(value);
                        }
                    }
            });
            $scope.tags = newTags;
        };

        $scope.upload = function () {
            //File attachment logic.
        };

        $scope.save = function () {
            //Restservice call.
        };

        $scope.back = function () {
            $location.path('/datasets');
        };

    }

});
