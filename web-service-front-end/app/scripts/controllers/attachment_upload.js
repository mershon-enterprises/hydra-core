'use strict';

//Attachment Upload Controller

//Collects all required data from the user to be submitted to the Restclient.
//Performs client-side verification of input and extraction of file properties
//from attachments.
angular.module('webServiceApp').controller('AttachmentUploadCtrl',
    function (
        $location,
        $rootScope,
        $scope,
        NotificationService,
        RestService,
        Session,
        EVENTS
        )
    {

    $rootScope.controller = 'AttachmentUpload';

    //The user must have a session...
    if (Session.exists()) {

        $scope.filename = '';
        $scope.createdBy = Session.getEmail();
        $scope.dateCreated = new Date();
        $scope.tags = [];
        $scope.file = null;
        $scope.fileData = null;

        //Allows us to forward click events from our nice-looking styled
        //upload button to the hidden and unstyle-able nasty-looking file
        //input field.
        $('.upload-button').click(function() {
            $('.upload-input').click();
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

                //For every row...
                $.each($scope.tags, function(index, value) {
                        //If you found the entered tag description in another
                        //tag.
                        if (value.description) {
                            //It's a duplicate.
                            if (value.description === description) {
                                duplicateFlag = true;
                            }
                        }
                });
                //If there are no duplicates...
                if (!duplicateFlag) {

                    //Add the tag row.
                    $scope.tags.push(
                        {
                            'description' : description,
                            'value' : value
                        }
                    );
                    //Clear the tag inputs.
                    $('.tag-input').val('');
                }
                else {
                    NotificationService.error(
                        'Invalid Tag',
                        'Duplicate Tag Name.'
                    );
                }
            }
            else {
                NotificationService.error(
                    'Invalid Tag',
                    'Both description and value cannot be blank.'
                );
            }
        };

        //Removes all rows that match the provided tag description.
        $scope.removeRow = function(description) {

            var newTags = [];

            //For every tag row...
            $.each($scope.tags, function(index, value) {
                    //If it has a description...
                    if (value.description) {
                        //And it doesn't match the entered description...
                        if (value.description !== description) {
                            //Add it to the new container.
                            newTags.push(value);
                        }
                    }
            });
            //Make the existing container equal to the new container. Removing
            //All tags that matched the description.
            $scope.tags = newTags;
        };

        //Creates a new dataset via RestService.submitData() and prompts user
        //of success or failure.
        $scope.save = function () {

            if($scope.filename === '' || $scope.filename === null) {
                NotificationService.error(
                    'Invalid Filename',
                    'Filename cannot be blank.'
                );
                return;
            }

            //If there is a file to save...
            if ($scope.file) {

                //Verify that the tag input fields are empty. If they are not,
                //ask the user if they'd like to save the tag. If they say yes,
                //do it.
                var tagNameInput = $('#tag-name-input').val();
                var tagValueInput = $('#tag-value-input').val();

                console.log(tagNameInput);
                console.log(tagValueInput);

                if( tagNameInput !== '' ||
                    tagValueInput !== '' ||
                    tagNameInput !== null ||
                    tagValueInput !== null ) {
                    var ans = confirm('You have an unsaved tag. Save it?');
                    if(ans) {
                        $scope.addRow(tagNameInput, tagValueInput);
                    }
                }

                //Make a new dataItems array that contains the tags as
                //restclient.PrimitiveData objects without modifying $scope.tags
                var dataItems = [];
                $.each($scope.tags, function(index, value) {
                    dataItems.push(
                        restclient.PrimitiveData(
                            'text',
                            value.description,
                            value.value
                        ));
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
                        NotificationService.success(
                            'File: ' + $scope.filename,
                            'Submitted Successfully!'
                        );
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
            }
        };

        //Back button to return to the attachment explorer view.
        $scope.back = function () {
            $location.path('/attachment_explorer');
        };

    }

});
