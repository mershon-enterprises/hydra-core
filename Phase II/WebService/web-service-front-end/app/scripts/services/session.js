'use strict';

//Session Singleton.
angular.module('webServiceApp').service('Session', function (localStorageService) {
    this.create = function (tokenExpirationDate, token, email, firstName,
        lastName, permissions) {
        this.tokenExpirationDate = Date(tokenExpirationDate);
        this.token = token;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.permissions = permissions;
        this.saveToLocalStorage();
    };
    this.destroy = function () {
        this.tokenExpirationDate = null;
        this.token = null;
        this.email = null;
        this.firstName = null;
        this.lastName = null;
        this.permissions = null;
    };
    this.exists = function () {
        if (this.token) {
            return true;
        }
        else if (localStorageService.get('token')) {
            this.restoreFromLocalStorage();
            return true;
        }
        return false;
    };
    this.getToken = function () {
        return this.token;
    };
    this.updateToken = function (token) {
        this.token = token;
        localStorageService.set('token', this.token);
    };
    this.saveToLocalStorage = function () {
        localStorageService.set('tokenExpirationDate', this.tokenExpirationDate);
        localStorageService.set('token', this.token);
        localStorageService.set('email', this.email);
        localStorageService.set('firstName', this.firstName);
        localStorageService.set('lastName', this.lastName);
        localStorageService.set('permissions', this.permissions);
    };
    this.restoreFromLocalStorage = function () {
        this.tokenExpirationDate = localStorageService.get('tokenExpirationDate', this.tokenExpirationDate);
        this.token = localStorageService.get('token');
        this.email = localStorageService.get('email');
        this.firstName = localStorageService.get('firstName');
        this.lastName = localStorageService.get('lastName');
        this.permissions = localStorageService.get('permissions');
    };
    return this;
});
