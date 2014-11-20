'use strict';

//Upload Controller

//Collects all required data from the user to be submitted to the Restclient.
//Performs client-side verification of input and extraction of file properties
//from attachments.
angular.module('webServiceApp').controller('AttachmentUploadCtrl', function ($scope, $location, Session, RestService, EVENTS, NotificationService) {

    //If the user is logged in...
    if (Session.exists()) {

        $scope.filename = '';
        $scope.createdBy = Session.getEmail();
        $scope.dateCreated = new Date();
        $scope.tags = [];
        $scope.file = null;

        //If a new file is attached, set the filename stored in scope to that
        //file's filename. The user will then be allowed to change the filename
        //in an input box if they choose.
        $scope.$watch('file', function () {
            if($scope.file) {
                $scope.filename = $scope.file.name;
            }
        });

        //Adds a tag row to the tag table. Prevents adding duplicate values.
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
                    window.btoa($scope.file)
                );

                //Add it to dataItems.
                dataItems.push(attachment);

                //Invoke the restservice to submit the dataset and attachment.
                RestService.submitData(
                    $scope.dateCreated,
                    $scope.createdBy,
                    dataItems
                ).then(
                function(success)
                {
                    if (success[0] === EVENTS.promiseSuccess) {
                        NotificationService.success('File: ' + $scope.file.name, 'Submitted Successfully!');
                    }
                },
                function(error) {
                    if (error[0] === EVENTS.badStatus) {
                        NotificationService.error('Server unreachable.', 'Please contact support.');
                    }
                    else if (error[0] === EVENTS.promiseFailed) {
                        NotificationService.error('Critical error.', 'Please contact support.');
                    }
                });
            }
        };

        //Back button to return to the datasets view.
        $scope.back = function () {
            $location.path('/datasets');
        };

    }

});
