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
            //the UI select box.
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

            //Tracks how long the current file will be shared.
            $scope.duration = 'forever';

            //List the options that will be available for duration.
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

            //Small check that determines if the duration box should be displayed
            //based on share mode.
            $scope.showDuration = false;
            $scope.checkForDuration = function() {
                if ($scope.shareMode === 'none') {
                    $scope.showDuration = false;
                }
                else {
                    $scope.showDuration = true;
                }
            };

            $scope.generateShareURL = function() {
                //Call the RestService to get the URL for that file in the
                //backend.
                RestService.getAttachmentDownloadLink($scope.ukey, expDate).then(
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

            $scope.copyURLtoClipboard = function() {
                window.prompt('Copy to clipboard: Ctrl+C, Enter', $scope.shareLink);
            };

            //When the user clicks the save button, perform logic based on which
            //shareMode we are currently in.
            $scope.shareFile = function() {

                var startDate = new Date(Date.now());
                var expDate = null;

                //Determine expiration date based on duration selected.
                switch ($scope.duration) {
                    case 'forever':
                        expDate = null;
                    break;

                    case 'week':
                        expDate = moment().add(7, 'days').toDate();
                    break;

                    case 'month':
                        expDate = moment().add(30, 'days').toDate();
                    break;

                    case 'year':
                        expDate = moment().add(365, 'days').toDate();
                    break;
                }

                //Call rest service depending on which share mode we're in.
                switch ($scope.shareMode) {

                    case 'none':
                        RestService.stopSharingAttachment($scope.ukey).then(
                        function(){
                            $scope.toggleDialogModal();
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
                        RestService.shareAttachment($scope.ukey, startDate, expDate, '*').then(
                        function(){
                            $scope.toggleDialogModal();
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

                    break;

                    case 'specific':

                        if($scope.emailShareList.length === 0) {
                            NotificationService.info(
                                'No Emails Entered',
                                'Enter some email addresses first.'
                            );
                        }
                        else {
                            RestService.shareAttachment($scope.ukey, startDate, expDate, $scope.emailShareList).then(
                            function(){
                                $scope.toggleDialogModal();
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
                        }
                    break;
                }

            };

        }
    };
});
