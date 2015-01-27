'use strict';

//Modal Loading Directive

//Allows the loading modal to be declared like an element in the markup.
angular.module('webServiceApp').directive('modalLoading', function() {
  return {
    restrict: 'E',
    scope: {
      show: '='
    },
    replace: true,
    templateUrl: 'templates/modal-loading.html'
  };
});
