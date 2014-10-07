'use strict';

/**
 * @ngdoc function
 * @name webServiceApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webServiceApp
 */
angular.module('webServiceApp')
  .controller('MainController', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
