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
        $scope.file = null;
        $scope.fileData = null;
        $scope.dateOptions = {
            dateFormat: 'yy-mm-dd',
            defaultDate: +7,
            minDate: new Date()
        };
        var currentDate = new Date();
        $scope.expirationDate = new Date(currentDate.setDate(currentDate.getDate()+7));

        //Allows us to forward click events from our nice-looking styled
        //upload button to the hidden and unstyle-able nasty-looking file
        //input field.
        $('.uploadButton').click(function() {
            $('.uploadInput').click();
        });

        //Watch for updated file attachment.
        $scope.$watch('file', function () {
            if($scope.file) {

                //Read file's binary data.
                //http://www.html5rocks.com/en/tutorials/file/dndfiles/
                var reader = new FileReader();
                // Closure to capture the file information.
                reader.onload = (function() {
                    return function(e) {
                        $scope.fileData = e.target.result;

                        //Keep a sticky notification during file upload.
                        var notification = NotificationService.showUploading(
                                'Uploading',
                                'Uploading file "' + $scope.filename + '". Please wait...');

                        //Invoke the restservice to replace the attachment in
                        //the dataset.
                        RestService.replaceAttachment(
                            $scope.ukey,
                            window.btoa($scope.fileData)
                        ).then(
                        function(success)
                        {
                            if (success[0] === EVENTS.promiseSuccess) {
                                NotificationService.success(
                                    'File: ' + $scope.filename,
                                    'Replaced Successfully!'
                                );
                                $rootScope.dataChanged = true;
                                $location.path('/attachment_explorer');
                            }
                            notification.dismiss();
                        },
                        function(error) {
                            if (error[0] === EVENTS.badStatus) {
                                NotificationService.error(
                                    'Server Unreachable',
                                    'Please contact support.'
                                );
                            }
                            else if (error[0] === EVENTS.promiseFailed) {
                                NotificationService.error(
                                    'Critical Error',
                                    'Please contact support.'
                                );
                            }
                            notification.dismiss();
                        });
                    };
                })($scope.file);
                reader.readAsBinaryString($scope.file);
            }
        });

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
                    $scope.fileMimeType = success[1].mime_type;
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

        // Watches for keystrokes in the filename input field.
        $('#fileName').keyup(function (event) {
            //Hides the rename button and makes it unclickable as long as there
            //is no text in the rename input field.
            if ($(this).val() === '') {
                $('.rename-button').addClass('inactive');
            }
            else {
                $('.rename-button').removeClass('inactive');
            }

            // If it's the enter key (keycode 13), then click the rename button
            if (event.keyCode === 13) {
                $('.rename-button').click();
            }
        });

        //Rename the file whose ukey is in scope.
        $scope.renameFile = function() {

            //If the user has typed in a new filename...
            if($scope.newFilename !== '' && $scope.newFilename !== null) {
                //Invoke the RestService to rename the attachment.
                RestService.renameAttachment(
                    $scope.ukey,
                    $scope.newFilename
                ).then(
                function(success) {
                    if (success[0] === EVENTS.promiseSuccess) {

                        //Mark to the system that the cache must be
                        //refreshed after this change.
                        $rootScope.dataChanged = true;

                        //Change the filename displayed in the UI for the user.
                        $scope.filename = $scope.newFilename;
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
            //Disable the button to avoid corrupting the API token
            $('#share-button').prop('disabled', true);

            //Call the RestService to get the URL for that file in the
            //backend.
            var expirationDate = $('.exp-date-field').val();
            RestService.getAttachmentDownloadLink($scope.ukey, expirationDate).then(
            function(success){
                if(success[0] === EVENTS.promiseSuccess) {
                    var uri = window.location.protocol + '//' +
                              window.location.host +
                              success[1];
                    $('.share-url').val(uri);
                    window.prompt('Copy to clipboard: Ctrl+C, Enter', uri);

                    //Re-enable the share button
                    $('#share-button').prop('disabled', false);
            }
            },
            function(){
                NotificationService.error(
                    'Critical Error',
                    'Please contact support.'
                );

                //Re-enable the share button
                $('#share-button').prop('disabled', false);
            });
        };

    }

});
