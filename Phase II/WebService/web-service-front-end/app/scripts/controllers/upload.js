'use strict';

angular.module('webServiceApp').controller('UploadCtrl', function ($scope, Session, RestService) {

    $scope.inputs = {
        wellName : null,
        wellTestDate : null,
        clientName : null,
        fieldName : null,
        leaseName : null,
        trailerNumber : null,
        wellTestNotes : null
    };

    $scope.upload = function (inputs) {

        var self = this;

        self.dateCreated = Date.now();
        self.createdByEmailAddress = null;
        self.dataItems = [];

        if (Session.exists()) {

            //Collect the user's email from the session
            self.createdByEmailAddress = Session.getEmail();

            //Deal with the primitives.
            var wellName = restclient.PrimitiveData('text', 'wellName', inputs.wellName);
            self.dataItems.push(wellName);

            var clientName = restclient.PrimitiveData('text', 'clientName', inputs.clientName);
            self.dataItems.push(clientName);

            var fieldName = restclient.PrimitiveData('text', 'fieldName', inputs.fieldName);
            self.dataItems.push(fieldName);

            var trailerNumber = restclient.PrimitiveData('text', 'trailerNumber', inputs.trailerNumber);
            self.dataItems.push(trailerNumber);

            //And then the optional primitives.
            if(inputs.leaseName) {
                var leaseName = restclient.PrimitiveData('text', 'leaseName', inputs.leaseName);
                self.dataItems.push(leaseName);
            }

            if(inputs.wellTestNotes) {
                var wellTestNotes = restclient.PrimitiveData('text', 'wellTestNotes', inputs.wellTestNotes);
                self.dataItems.push(wellTestNotes);
            }

            //TODO Attachment Logic

            RestService.submitData(self.dateCreated, self.createdByEmailAddress, self.dataItems);

        }



    };

});
