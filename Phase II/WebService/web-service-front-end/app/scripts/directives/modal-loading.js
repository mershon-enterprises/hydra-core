'use strict';

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
