'use strict';

//Footer Directive

angular.module('webServiceApp').directive('brandfooter', function() {
  return {
    restrict: 'E',
    templateUrl: 'templates/footer.html',
    controller: function ($scope, RestService) {
      RestService.getBranding().then(
        function(success) {
          $scope.companyLogo  = success[1]['company-logo'];
          $scope.contactPhone = success[1]['contact-phone'];
          $scope.contactEmail = success[1]['contact-email'];
        },
        function() {
          console.log('Footer component promise error.');
        }
      );
    }
  };
});
