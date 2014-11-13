'use strict';

//Attachment Controller

//Display attachment details to the user and provide controls for the attachments
//name and tags, as well as delete functionality.
angular.module('webServiceApp').controller('AttachmentDetailsCtrl', function ($rootScope, $location, $scope, RestService, NotificationService, Session) {

    //If the user is logged in...
    if (Session.exists()) {

        //The user should not be visiting this view unless sent from the
        //datasets controller. rootscope.ukey will be populated if they were.
        if (!$rootScope.ukey) {
            $location.path('/datasets');
        }
        else {
            RestService.getAttachmentInfo($rootScope.ukey).then(
            function(success) {
                $scope.filename = success.filename;
                $scope.dateCreated = success.date_created;
                $scope.createdBy = success.created_by;
                $scope.tags = success.primitive_text_data;
            },
            function (error) {});
        }

        $scope.back = function () {
            $location.path('/datasets');
        };

        //Rename the file whose ukey is in scope.
        $scope.renameFile = function() {

            var re = new RegExp('[a-z_\\-\\s0-9\\.]+\\.(txt|csv|pdf|doc|docx|xls|xlsx)$');
            var cacheValueRenamed = null;

            if($scope.newFilename !== '' && $scope.newFilename !== null) {
                if(re.test($scope.newFilename)) {
                    RestService.renameAttachment($scope.ukey, $scope.newFilename);
                    cacheValueRenamed = RestService.renameCacheDataValue($rootScope.ukey, $scope.newFilename);
                    if(cacheValueRenamed) {
                        NotificationService.success('Success', 'Attachment Renamed');
                    }
                }
                else {
                    NotificationService.error('Invalid filename.', 'Please try again.');
                }
            }
            else {
                NotificationService.error('Could not rename attachment.', 'Filename cannot be blank.');
            }

        };

        //Delete the file from cache and server whose ukey is in scope.
        $scope.deleteFile = function() {

            //TODO Redo as Promise?
            RestService.deleteAttachment($scope.ukey);
            var cacheValueDeleted = RestService.removeCacheDataValue($scope.ukey);

            if(cacheValueDeleted) {
                NotificationService.success('Success', 'Attachment Deleted');
                $location.path('/datasets');
            }
            else {
                NotificationService.error('Could not delete attachment.', 'Please try again.');
            }
        };

    }

});
