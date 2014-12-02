'use strict';

//http://stackoverflow.com/questions/18313576/confirmation-dialog-on-ng-click-angularjs
angular.module('webServiceApp').directive('ngConfirmClick', [ function() {
    return {
        link: function (scope, element, attr) {
            var msg = attr.ngConfirmClick || 'Are you sure?';
            var clickAction = attr.confirmedClick;
            element.bind('click',function () {
                if ( window.confirm(msg) ) {
                    scope.$eval(clickAction);
                }
            });
        }
    };
}]);
