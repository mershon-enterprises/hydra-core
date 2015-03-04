'use strict';

//Share Directive

//Provides logic for file-sharing modal box. Coupled with the attachment_details
//controller
angular.module('webServiceApp').directive('share', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/share.html',
        controller: function ($scope, NotificationService, RestService) {

            //Tracks the method of sharing selected by the user with ng-model on
            //the share mode select box.
            $scope.shareMode = 'none';

            //List the options that will be available in that select box. When
            //the user selects a label, the id of the option will be stored as
            //$scope.shareMode.
            $scope.shareOptions = [
                {
                    'id': 'none',
                    'label': 'Nobody'
                },
                {
                    'id': 'all',
                    'label': 'All Authenticated Users'
                },
                {
                    'id': 'url',
                    'label': 'Anyone with the URL'
                },
                {
                    'id': 'specific',
                    'label': 'Specific Users'
                }
            ];

            //Tracks how long the current file will be shared. Binded with
            //ng-model to the duration select box.
            $scope.duration = 'forever';

            //List the options that will be available for the duration select
            //box. When the user selects a label, the id of the option will
            //be stored in $scope.duration.
            $scope.durationOptions = [
                {
                    'id': 'forever',
                    'label': 'No Duration'
                },
                {
                    'id': 'week',
                    'label': 'One Week'
                },
                {
                    'id': 'month',
                    'label': 'One Month'
                },
                {
                    'id': 'year',
                    'label': 'One Year'
                }
            ];

            //On every change of the shareMode select box, this function will
            //run to determine if the duration select box should be displayed.
            $scope.showDuration = false;
            $scope.checkForDuration = function() {
                if ($scope.shareMode === 'none') {
                    $scope.showDuration = false;
                }
                else {
                    $scope.showDuration = true;
                }
            };

            //Set the default start and expiration dates for sharing.
            $scope.startDate = new Date(Date.now());
            $scope.expDate = null;

            //On every change of the duration select box, this function will
            //run to set the new expiration date based on the newly selected
            //duration.
            $scope.changeDuration = function() {

                //Reset the start date to the moment they select a new duration.
                $scope.startDate = new Date(Date.now());

                //Determine expiration date based on duration selected.
                switch ($scope.duration) {
                    case 'forever':
                        $scope.expDate = null;
                    break;

                    case 'week':
                        $scope.expDate = moment().add(1, 'weeks').toDate();
                    break;

                    case 'month':
                        $scope.expDate = moment().add(1, 'months').toDate();
                    break;

                    case 'year':
                        $scope.expDate = moment().add(1, 'years').toDate();
                    break;
                }
            };

            //Generates a URL that, if visited, will allow the user to download
            //a file regardless of other share permissions. Similar to a
            //Dropbox share link. The URL is bound via ng-model to a textarea
            //element via ng-model. The resulting URL will always appear there.
            //This function could not be in shareFile() because the link could
            //be generated multiple times before the user was finished.
            $scope.generateShareURL = function() {

                //Due to a caveat of the backend, we cannot set a share URL to
                //have a null expiration date. So set the date to... very far
                //away.
                if($scope.expDate === null) {
                    $scope.expDate = $scope.expDate = moment().add(1000, 'years').toDate();
                }

                //Call the RestService to get the URL for that file in the
                //backend.
                RestService.getAttachmentDownloadLink($scope.ukey, $scope.expDate).then(
                function(success){
                    var uri = window.location.protocol + '//' +
                              window.location.host +
                              success[1];
                    $scope.shareLink = uri;
                    NotificationService.success(
                        'Success',
                        'Share link has been generated.'
                    );
                },
                function(){
                    NotificationService.error(
                        'Critical Error',
                        'Please contact support.'
                    );
                });
            };

            //Opens browser prompt to help user copy the giant shareLink
            $scope.copyURLtoClipboard = function() {
                window.prompt('Copy to clipboard: Ctrl+C, Enter', $scope.shareLink);
            };

            //Shares the file after the user clicks the UI's "Save" button.
            //Call the appropriate restclient method, and then close the modal
            //on success.
            $scope.shareFile = function() {

                //Call rest service depending on which share mode we're in.
                switch ($scope.shareMode) {

                    case 'none':
                        //Stop sharing the attachment...
                        RestService.stopSharingAttachment($scope.ukey).then(
                        function(){
                            //Close the modal.
                            $scope.toggleDialogModal();
                            //Repopulate the UI with the new sharing info.
                            $scope.collectFileInfo();
                            NotificationService.success(
                                'Success',
                                'Your file is no longer shared.'
                            );
                        },
                        function(){
                            NotificationService.error(
                                'Critical Error',
                                'Please contact support.'
                            );
                        });
                    break;

                    case 'all':
                        //Passing in '*' to the backend's email list will
                        //share the file to all users.
                        RestService.shareAttachment(    $scope.ukey,
                                                        $scope.startDate,
                                                        $scope.expDate,
                                                        '*').then(
                        function(){
                            $scope.toggleDialogModal();
                            $scope.collectFileInfo();
                            NotificationService.success(
                                'Success',
                                'Your file is shared with all users.'
                            );
                        },
                        function(){
                            NotificationService.error(
                                'Critical Error',
                                'Please contact support.'
                            );
                        });
                    break;

                    case 'url':
                        //Logic for this case is handled in generateShareURL()
                        $scope.toggleDialogModal();
                    break;

                    case 'specific':
                        if($scope.emailShareList.length === 0) {
                            NotificationService.info(
                                'No Emails Entered',
                                'Enter some email addresses first.'
                            );
                        }
                        else {
                            RestService.shareAttachment(    $scope.ukey,
                                                            $scope.startDate,
                                                            $scope.expDate,
                                                            $scope.emailShareList).then(
                            function(){
                                $scope.toggleDialogModal();
                                $scope.collectFileInfo();
                                NotificationService.success(
                                    'Success',
                                    'Your file is shared with the specified users.'
                                );
                            },
                            function(){
                                NotificationService.error(
                                    'Critical Error',
                                    'Please contact support.'
                                );
                            });
                        }
                    break;
                }

                //If the modal closes, always clear the old shareLink.
                $scope.shareLink = null;
            };

        }
    };
});
