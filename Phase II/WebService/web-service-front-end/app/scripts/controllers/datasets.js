'use strict';

angular.module('webServiceApp').controller('DatasetsCtrl', function ($scope, RestService, Session) {

    if (Session.exists()) {

        $scope.data = RestService.getCacheValue('data');

        $scope.gridOptions = {
            data: 'data',
            sortInfo : { fields: ['date_created'], directions: ['desc'] },
            columnDefs: [
                {field: 'filename', displayName: 'Filename'},
                {field: 'bytes', displayName: 'Filesize'},
                {field: 'client_name', displayName: 'Client'},
                {field: 'field_name', displayName: 'Field'},
                {field: 'well_name', displayName: 'Well'},
                {field: 'trailer_number', displayName: 'Trailer'},
                {field: 'created_by', displayName: 'Author'},
                {field: 'date_created', displayName: 'Creation Date'}
            ]
        };

    }

});



