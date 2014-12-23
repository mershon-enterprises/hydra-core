'use strict';

//Attachment Upload Controller

//Collects all required data from the user to be submitted to the Restclient.
//Performs client-side verification of input and extraction of file properties
//from attachments.
angular.module('webServiceApp').controller('AttachmentUploadCtrl', function ($rootScope, $scope, $location, Session, RestService, EVENTS, NotificationService) {

    //If the user is logged in...
    if (Session.exists()) {

        $scope.filename = '';
        $scope.createdBy = Session.getEmail();
        $scope.dateCreated = new Date();
        $scope.tags = [];
        $scope.file = null;
        $scope.fileData = null;

        $('.uploadButton').click(function() {
            $('.uploadInput').click();
        });

        //Watch for new file attachment.
        $scope.$watch('file', function () {
            if($scope.file) {
                //If a new file is attached, set the filename stored in scope
                //to the file's filename. The user will then be allowed to
                //change the filename in an input box if they choose.
                $scope.filename = $scope.file.name;

                //Read file's binary data.
                //http://www.html5rocks.com/en/tutorials/file/dndfiles/
                var reader = new FileReader();
                // Closure to capture the file information.
                reader.onload = (function() {
                    return function(e) {
                        $scope.fileData = e.target.result;
                    };
                })($scope.file);
                reader.readAsBinaryString($scope.file);
            }
        });

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
                    $('table * input').val('');
                }
                else {
                    NotificationService.error('Invalid Tag.', 'Duplicate Tag Name.');
                }
            }
            else {
                NotificationService.error('Invalid Tag.', 'Both description and value cannot be blank.');
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
        };

        //Creates a new dataset via RestService.submitData() and prompts user
        //of success or failure.
        $scope.save = function () {

            //Verify filename is good to go.
            var re = new RegExp('[a-z_\\-\\s0-9\\.]+\\.(txt|csv|pdf|doc|docx|xls|xlsx)$');

            if($scope.filename === '' || $scope.filename === null) {
                NotificationService.error('Could not save attachment.', 'Filename cannot be blank.');
                return;
            }

            if(!re.test($scope.filename)) {
                NotificationService.error('Invalid filename.', 'Please try again.');
                return;
            }

            //If there is a file to save...
            if ($scope.file) {

                //Make a new dataItems array that contains the tags as
                //restclient.PrimitiveData objects without modifying $scope.tags
                var dataItems = [];
                $.each($scope.tags, function(index, value) {
                    dataItems.push(restclient.PrimitiveData('text', value.description, value.value));
                });

                //Create the attachment as restclient.Attachment object.
                var attachment = restclient.Attachment(
                    $scope.filename,
                    $scope.file.type,
                    window.btoa($scope.fileData)
                );

                //Add it to dataItems.
                dataItems.push(attachment);

                //Keep a sticky notification during file upload.
                var notification = NotificationService.showUploading(
                        'Uploading',
                        'Uploading file "' + $scope.filename + '". Please wait...');

                //Invoke the restservice to submit the dataset and attachment.
                RestService.submitData(
                    $scope.dateCreated,
                    $scope.createdBy,
                    dataItems
                ).then(
                function(success)
                {
                    if (success[0] === EVENTS.promiseSuccess) {
                        NotificationService.success('File: ' + $scope.filename, 'Submitted Successfully!');
                        $rootScope.dataChanged = true;
                        $location.path('/attachment_explorer');
                    }
                    notification.dismiss();
                },
                function(error) {
                    if (error[0] === EVENTS.badStatus) {
                        NotificationService.error('Server unreachable.', 'Please contact support.');
                    }
                    else if (error[0] === EVENTS.promiseFailed) {
                        NotificationService.error('Critical error.', 'Please contact support.');
                    }
                    notification.dismiss();
                });
            }
        };

        //Back button to return to the attachment explorer view.
        $scope.back = function () {
            $location.path('/attachment_explorer');
        };

    }

});
