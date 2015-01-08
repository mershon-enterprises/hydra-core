'use strict';

//Attachment Details Controller

//Display attachment details to the user and provide options for rename, delete,
//and tag (add/remove) controls.
angular.module('webServiceApp').controller('AttachmentDetailsCtrl',
    function (  $location,
                $rootScope,
                $scope,
                NotificationService,
                RestService,
                Session,
                EVENTS
    ){

    $rootScope.controller = 'AttachmentDetails';

    //Only run if the user has a session.
    if (Session.exists()) {

        //Storage variables for the file this controller is operating on.
        $scope.filename = null;
        $scope.dateCreated = null;
        $scope.createdBy = null;
        $scope.tags = [];
        $scope.dateOptions = {
            dateFormat: 'yy-mm-dd',
            defaultDate: +7,
            minDate: new Date()
        };
        var currentDate = new Date();
        $scope.expirationDate = new Date(currentDate.setDate(currentDate.getDate()+7));

        //The user should not be visiting this view unless sent from the
        //attachment explorer controller. $rootscope.ukey will be populated if
        //they were.
        if (!$rootScope.ukey) {
            //Return user to attachment explorer.
            $location.path('/attachment_explorer');
        }
        //If the ukey is in the $rootScope, the user has visted this view in the
        //correct way. Invoke the RestService to get the file data from the
        //backend and store them in the $scope variables.
        else {
            RestService.getAttachmentInfo($rootScope.ukey).then(
            function(success) {
                if (success[0] === EVENTS.promiseSuccess) {
                    $scope.filename = success[1].filename;
                    $scope.dateCreated = success[1].date_created;
                    $scope.createdBy = success[1].created_by;
                    $scope.tags = success[1].primitive_text_data;
                }
            },
            //Notify user if something went wrong.
            function (error) {
                if(error[0] === EVENTS.promiseFailed) {
                    NotificationService.error(
                        'Critical Error',
                        'Please contact support.'
                    );
                }
            });
        }

        //Rename the file whose ukey is in scope.
        $scope.renameFile = function() {

            //Regular expression for validating filenames.
            var re = new RegExp(
                '[a-z_\\-\\s0-9\\.]+\\.(txt|csv|pdf|doc|docx|xls|xlsx)$'
            );

            //If the user has typed in a new filename...
            if($scope.newFilename !== '' && $scope.newFilename !== null) {
                //Validate it against the regular expression...
                if(re.test($scope.newFilename)) {
                    //Invoke the RestService to rename the attachment.
                    RestService.renameAttachment(
                        $scope.ukey,
                        $scope.newFilename).then(
                        function(success) {
                            if (success[0] === EVENTS.promiseSuccess) {

                                //Mark to the system that the cache must be
                                //refreshed after this change.
                                $rootScope.dataChanged = true;
                                //Notify user that the file has been renamed.
                                NotificationService.success(
                                    'Success',
                                    'Attachment Renamed'
                                );
                            }
                        },
                        //Notify user that something went wrong.
                        function(error) {
                            if(error[0] === EVENTS.promiseFailed) {
                                NotificationService.error(
                                    'Critical Error',
                                    'Please contact support.'
                                );
                            }
                        });
                }
                else {
                    NotificationService.error(
                        'Invalid Filename',
                        'Please enter a valid filename.'
                    );
                }
            }
            else {
                NotificationService.error(
                    'Invalid Filename',
                    'Filename cannot be blank.');
            }

        };

        //Delete the file from the backend whose ukey is in scope.
        $scope.deleteFile = function() {
            //Invoke the RestService to delete the file with the ukey that is
            //in scope.
            RestService.deleteAttachment($scope.ukey).then(
                function(success) {
                    //If the promise succeeded...
                    if (success[0] === EVENTS.promiseSuccess) {
                            //Notify the user.
                            NotificationService.success(
                                'Success',
                                'Attachment Deleted'
                            );
                            //Mark that the cache must be updated.
                            $rootScope.dataChanged = true;
                            //Return user to attachment explorer.
                            $location.path('/attachment_explorer');
                    }
                    else {
                        NotificationService.error(
                            'Critical Error',
                            'Please contact support.'
                        );
                    }
                },
                function(error) {
                    if (error[0] === EVENTS.promiseFailed) {
                        NotificationService.error(
                            'Critical Error',
                            'Please contact support.'
                        );
                    }
                    else if (error[0] === EVENTS.badStatus) {
                        NotificationService.error(
                            'Server Unreachable',
                            'Please contact support.'
                        );
                    }
            });
        };

        //Adds a tag row to the tag table. Prevents adding duplicate values.
        $scope.addRow = function(description, value) {
            //If both description and value were provided...
            if (description && value) {

                var duplicateFlag = false;

                //For every tag this file has already...
                $.each($scope.tags, function(index, value) {
                        //If the tag has a description...
                        if (value.description) {
                            //And the entered description matches this
                            //tag's description, mark that it's a duplicate.
                            if (value.description === description) {
                                duplicateFlag = true;
                            }
                        }
                });

                //If no duplicate was found...
                if (!duplicateFlag) {

                    //Add this tag to the tags that are displayed in the UI.
                    $scope.tags.push(
                        {'description' : description, 'value' : value}
                    );

                    //Add the tag to the attachment in the backend.
                    RestService.submitTag(
                        $scope.ukey,
                        'text',
                        description,
                        value
                    ).then(
                    function(success) {
                        if (success[0] === EVENTS.promiseSuccess) {
                            NotificationService.success(
                                'Success',
                                'Tag Added.'
                            );
                        }
                    },
                    function(error) {
                        if (error[0] === EVENTS.promiseFailed) {
                            NotificationService.error(
                                'Critical Error',
                                'Please contact support.'
                            );
                        }
                        else if (error[0] === EVENTS.badStatus) {
                            NotificationService.error(
                                'Server Unreachable',
                                'Please contact support.');
                        }
                    });
                }
                else {
                    NotificationService.error(
                        'Invalid Tag',
                        'Tag cannot be a duplicate.');
                }

            }
            else {
                NotificationService.error(
                    'Invalid Tag',
                    'Tag name and value cannot be blank.');
            }
        };

        //Removes all rows that match the provided tag description.
        $scope.removeRow = function(description) {

            var newTags = [];

            //For every tag in this file...
            $.each($scope.tags, function(index, value) {
                    //If the tag has a description...
                    if (value.description) {
                        //And that description is not the one that was to be
                        //deleted, add it to a new array.
                        if (value.description !== description) {
                            newTags.push(value);
                        }
                    }
            });

            //Use only those new tags in the UI.
            $scope.tags = newTags;

            //Then delete the tag from the backend.
            RestService.deleteTag($scope.ukey, 'text', description).then(
                function(success) {
                    if (success[0] === EVENTS.promiseSuccess) {
                        NotificationService.success('Success', 'Tag Removed.');
                    }
                },
                function(error) {
                    if (error[0] === EVENTS.promiseFailed) {
                        NotificationService.error(
                            'Critical Error',
                            'Please contact support.'
                        );
                    }
                    else if (error[0] === EVENTS.badStatus) {
                        NotificationService.error(
                            'Server Unreachable',
                            'Please contact support.'
                        );
                    }
            });
        };

        //Back button to return to the attachment explorer view.
        $scope.back = function () {
            $location.path('/attachment_explorer');
        };

        //Share link URL button
        $scope.generateShareLink = function () {
            //Call the RestService to get the URL for that file in the
            //backend.
            var expirationDate = $('.exp-date-field').val();
            RestService.getAttachmentDownloadLink($scope.ukey, expirationDate).then(
            function(success){
                if(success[0] === EVENTS.promiseSuccess) {
                    $('.share-url').val(    window.location.protocol + '//' +
                                            window.location.host +
                                            success[1]);
            }
            },
            function(){
                NotificationService.error(
                    'Critical Error',
                    'Please contact support.'
                );
            });
        };

    }

});
