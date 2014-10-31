'use strict';

angular.module('webServiceApp').controller('DatasetsCtrl', function ($rootScope, $scope, $window, $timeout, EVENTS, RestService, NotificationService, Session) {

    //If the cache is updated, redraw the page by forcing a window-resize
    //event.
    $rootScope.$watch('cache', function() {
        var w = angular.element($window);
        $timeout(function(){ w.triggerHandler('resize'); });
    });

    if (Session.exists()) {

        //Retrieve dataset data from the cache.
        var rawData = RestService.getCacheValue('data');

        var data = [];
        var attachments = [];
        var createdBy = null;
        var dateCreated = null;
        var clientName = null;
        var fieldName = null;
        var wellName = null;
        var trailerNumber = null;

        //Parse the data fromt the restClient into a format ngTable wants.
        //[{key1:value1, key2:value2, ...}, {key1:value1, key2:value2, ...}, ...]
        $.each(rawData, function(index, value){
            createdBy = {created_by: value['created_by']};
            dateCreated = {date_created: value['date_created']};
            $.each(value['data'], function(index, value){
                if(value['type'] === 'attachment') {
                    attachments.push(value);
                }
                else if(value['type'] === 'text') {
                    if(value['description'] === 'clientName') {
                        clientName = {client_name: value['value']};
                    }
                    else if(value['description'] === 'fieldName') {
                        fieldName = {field_name: value['value']};
                    }
                    else if(value['description'] === 'wellName') {
                        wellName = {well_name: value['value']};
                    }
                    else if(value['description'] === 'trailerNumber') {
                        trailerNumber = {trailer_number: value['value']};
                    }
                }
            });
            $.each(attachments, function(index, value){
                data.push($.extend(value, createdBy, dateCreated,
                    clientName, fieldName, wellName, trailerNumber));
            });
        });

        console.log(data);

        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 10
        },
        {
            total: data.length,
            getData: function($defer, params) {
                $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

    }

});



