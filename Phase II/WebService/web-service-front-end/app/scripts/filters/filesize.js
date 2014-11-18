'use strict';

//http://farsim.wordpress.com/2013/04/27/size-conversion-filter-using-angularjs/
angular.module('webServiceApp').filter('filesize', function () {
    return function (bytes) {
        if(bytes <= 0) {
            return 0;
        }
        var s = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
        var e = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(e))).toFixed(0) + ' ' + s[e];
    };
});
