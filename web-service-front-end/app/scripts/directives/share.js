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

            //When the user clicks the save button, perform logic based on which
            //shareMode we are currently in.
            $scope.shareFile = function() {
                switch ($scope.shareMode) {

                    case 'none':
                        RestService.stopSharingAttachment($scope.ukey).then(
                        function(){
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
                        RestService.shareAttachment($scope.ukey, '1970-01-01', '2015-12-12', '*').then(
                        function(){
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
                        console.log('URL!');
                    break;

                    case 'specific':
                        console.log('Specific!');
                    break;

                }
                $scope.toggleDialogModal();
            };

        }
    };
});
