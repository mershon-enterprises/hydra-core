'use strict';

//Attachment Details Controller

//Display attachment details to the user and provide controls for the attachments
//name and tags, as well as delete functionality.
angular.module('webServiceApp').controller('AttachmentDetailsCtrl', function ($rootScope, $location, $scope, RestService, NotificationService, Session, EVENTS) {

    //If the user is logged in...
    if (Session.exists()) {

        $scope.filename = null;
        $scope.dateCreated = null;
        $scope.createdBy = null;
        $scope.tags = [];

        //The user should not be visiting this view unless sent from the
        //attachment explorer controller. rootscope.ukey will be populated if
        //they were.
        if (!$rootScope.ukey) {
            $location.path('/attachment_explorer');
        }
        else {
            RestService.getAttachmentInfo($rootScope.ukey).then(
            function(success) {
                if (success[0] === EVENTS.promiseSuccess) {
                    $scope.filename = success[1].filename;
                    $scope.dateCreated = success[1].date_created;
                    $scope.createdBy = success[1].created_by;
                    $scope.tags = success[1].data;
                }
            },
            function (error) {
                if(error[0] === EVENTS.promiseFailed) {
                    NotificationService.error('Critical error.', 'Please contact support.');
                }
            });
        }

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

            RestService.deleteAttachment($scope.ukey).then(
                function(success) {
                        if (success[0] === EVENTS.promiseSuccess) {
                            if(RestService.removeCacheDataValue($scope.ukey)) {
                                NotificationService.success('Success', 'Attachment Deleted');
                                $location.path('/attachment_explorer');
                            }
                            else {
                                console.log('Attachment deleted from server but not cache!');
                            }
                        }
                    },
                    function(error) {
                        if (error[0] === EVENTS.promiseFailed) {
                            NotificationService.error('Critical error.', 'Please contact support.');
                        }
                        else if (error[0] === EVENTS.badStatus) {
                            NotificationService.error('Cannot connect to server.', 'Please contact support.');
                        }
                    });
        };

        //Adds a tag row to the tag table. Prevents adding duplicate values.
        $scope.addRow = function(description, value) {
            if (description && value) {
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

                    RestService.submitTag($scope.ukey, 'text', description, value).then(
                    function(success) {
                        if (success[0] === EVENTS.promiseSuccess) {
                            NotificationService.success('Success', 'Tag Added.');
                        }
                    },
                    function(error) {
                        if (error[0] === EVENTS.promiseFailed) {
                            NotificationService.error('Critical error.', 'Please contact support.');
                        }
                        else if (error[0] === EVENTS.badStatus) {
                            NotificationService.error('Cannot connect to server.', 'Please contact support.');
                        }
                    });
                }
                else {
                    NotificationService.error('Invalid Tag.', 'Tag cannot be a duplicate of another.');
                }

            }
            else {
                NotificationService.error('Invalid Tag.', 'Tag name and value cannot be blank.');
            }
        };

        //Removes all rows that match the provided tag description.
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

            RestService.deleteTag($scope.ukey, 'text', description).then(
                function(success) {
                    if (success[0] === EVENTS.promiseSuccess) {
                        NotificationService.success('Success', 'Tag Removed.');
                    }
                },
                function(error) {
                    if (error[0] === EVENTS.promiseFailed) {
                        NotificationService.error('Critical error.', 'Please contact support.');
                    }
                    else if (error[0] === EVENTS.badStatus) {
                        NotificationService.error('Cannot connect to server.', 'Please contact support.');
                    }
            });
        };

        //Back button to return to the attachment explorer view.
        $scope.back = function () {
            $location.path('/attachment_explorer');
        };

    }

});
