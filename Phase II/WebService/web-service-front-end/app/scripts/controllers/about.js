'use strict';

/**
 * @ngdoc function
 * @name webServiceApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the webServiceApp
 */
angular.module('webServiceApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
