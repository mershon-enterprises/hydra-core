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
        $scope.extension = null;
        $scope.dateCreated = null;
        $scope.createdBy = null;
        $scope.tags = [];
        $scope.file = null;
        $scope.fileData = null;
        $scope.shareLink = null;
        $scope.emailShareList = [];

        $scope.dialogShown = false;
        $scope.toggleDialogModal = function() {
            $scope.dialogShown = !$scope.dialogShown;
        };

        //Allows us to forward click events from our nice-looking styled
        //upload button to the hidden and unstyle-able nasty-looking file
        //input field.
        $('.upload-button').click(function() {
            $('.upload-input').click();
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
                    $scope.newFilename = $scope.filename;
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

            var expirationDate = moment().format('YYYY[-]MM[-]DD');

            //Call the RestService to get the URL for that file in the
            //backend.
            RestService.getAttachmentDownloadLink($scope.ukey, expirationDate).then(
            function(success){
                if(success[0] === EVENTS.promiseSuccess) {
                    var uri = window.location.protocol + '//' +
                              window.location.host +
                              success[1];
                    $scope.shareLink = uri;
                }
            },
            function(){
                NotificationService.error(
                    'Critical Error',
                    'Please contact support.'
                );
            });
        }

        $scope.copyURLtoClipboard = function() {
            window.prompt('Copy to clipboard: Ctrl+C, Enter', $scope.shareLink);
        };

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
                if(!$('.rename-button').hasClass('inactive')) {
                    $('.rename-button').click();
                }
            }

            // Get last substring of array after a '.' character.
            // whatever.min.js -> js
            $scope.extension = $scope.filename.split('.').slice(-1)[0];

            // If the filename field doesn't contain the previous filename's
            // extension, display a warning. If the previous file had no
            // extension, ignore this.
            if($(this).val() !== '') {
                if ($scope.filename.indexOf('.') > -1) {
                    if ($(this).val().toLowerCase().split('.').slice(-1)[0] === $scope.extension) {
                        $('.extension-warning').hide();
                    }
                    else {
                        $('.extension-warning').show();
                    }
                }
            }

        });

        // Validate that a filename was entered properly and notify user if
        // it was not.
        $scope.validateFilename = function () {

            // Make sure it's not blank.
            if ($scope.newFilename === '' || $scope.newFilename === null) {
                NotificationService.error(
                    'Invalid Filename',
                    'Filename cannot be blank.');
                return false;
            }

            //Place other filename validations here.

            return true;
        };

        //Rename the file whose ukey is in scope.
        $scope.renameFile = function() {
            if ($scope.validateFilename()) {
                //Invoke the RestService to rename the attachment.
                RestService.renameAttachment(
                    $scope.ukey,
                    $scope.newFilename
                ).then(
                function(success) {
                    if (success[0] === EVENTS.promiseSuccess) {

                        //Change the filename displayed in the UI for the user.
                        $scope.filename = $scope.newFilename;

                        //Change the ukey to reflect the new filename.
                        $scope.ukey = $scope.newFilename + '\n' + $scope.ukey.split('\n')[1];

                        //Hide extension warning.
                        $('.extension-warning').hide();

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

        $scope.downloadFile = function() {
            //Call the RestService to get the URL for that file in the
            //backend.
            RestService.getAttachmentURL($rootScope.ukey).then(
            function(success){
                //If you got it, set the browser to that URL to have the
                //browser start file-download.
                if(success[0] === EVENTS.promiseSuccess) {
                window.location.href = success[1];
            }
            },
            function(){
                NotificationService.error(
                    'Critical Error',
                    'Please contact support.'
                );
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
                            // Clear the tag inputs after a submission.
                            $('.tag-input').val('');

                            // Notify user of success.
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

        //Back button to return to the attachment explorer view. Check if a
        //tag needs to be saved before performing the redirect and prompt the
        //user if there is.
        $scope.back = function () {
            //Verify that the tag input fields are empty. If they are not,
                //ask the user if they'd like to save the tag. If they say yes,
                //do it.
                var tagNameInput = $('#tag-name-input').val();
                var tagValueInput = $('#tag-value-input').val();

                if( tagNameInput && tagValueInput ) {
                    var ans = confirm('You have an unsaved tag. Save it?');
                    if(ans) {
                        $scope.addRow(tagNameInput, tagValueInput);
                    }
                }

            $location.path('/attachment_explorer');
        };

        /* Selectize */
        var REGEX_EMAIL = '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' + '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)';

        var formatName = function(item) {
            return $.trim((item.first_name || '') + ' ' + (item.last_name || ''));
        };

        $scope.selectizeOptions = {
            plugins: ['remove_button'],
            persist: true,
            maxItems: null,
            valueField: 'email',
            labelField: 'name',
            searchField: ['first_name', 'last_name', 'email'],
            sortField: [
                {field: 'first_name', direction: 'asc'},
                {field: 'last_name', direction: 'asc'}
            ],
            onItemAdd: function(value) {
                $scope.emailShareList.push(value);
            },
            onItemRemove: function(value) {
                var index = $scope.emailShareList.indexOf(value);
                if (index > -1) {
                    $scope.emailShareList.splice(index, 1);
                }
            },
            render: {
                item: function(item, escape) {
                    var name = formatName(item);
                    return '<div>' +
                    (name ? '<span class="name">' + escape(name) + '</span>' : '') +
                    (item.email ? '<span class="email">[' + escape(item.email) + ']</span>' : '') +
                    '</div>';
                },
                option: function(item, escape) {
                    var name = formatName(item);
                    var label = name || item.email;
                    var caption = name ? item.email : null;
                    return '<div>' +
                    '<span class="label">' + escape(label) + '</span>' +
                    (caption ? '<span class="caption">[' + escape(caption) + ']</span>' : '') +
                    '</div>';
                }
            },
            createFilter: function(input) {
                var regexpA = new RegExp('^' + REGEX_EMAIL + '$', 'i');
                var regexpB = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i');
                return regexpA.test(input) || regexpB.test(input);
            },
            create: function(input) {
                if ((new RegExp('^' + REGEX_EMAIL + '$', 'i')).test(input)) {
                return {email: input};
            }
            var match = input.match(new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i'));
            if (match) {
                var name = $.trim(match[1]);
                var pos_space = name.indexOf(' ');
                var first_name = name.substring(0, pos_space);
                var last_name = name.substring(pos_space + 1);
                return {
                    email: match[2],
                    first_name: first_name,
                    last_name: last_name
                };
            }
            NotificationService.warning('Invalid Email', 'Please try again.');
            return false;
            }
        };

    }
});
