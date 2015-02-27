'use strict';

//Documentation Controller

//Logic available to the documentation template.
angular.module('webServiceApp').controller('DocumentationCtrl', function ($rootScope, $scope) {

    $rootScope.controller = 'Documentation';

    $scope.navigate = function (anchor) {
        console.log(anchor);
        $('html,body').animate({
            scrollTop: $('a[name=\"' + anchor + '\"]').offset().top
        });
    };

});
