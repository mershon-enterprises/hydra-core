//Session Singleton.
angular.module('webServiceApp').service('Session', function () {
    this.create = function (tokenExpirationDate, token, email, firstName,
        lastName, permissions) {
        this.tokenExpirationDate = tokenExpirationDate;
        this.token = token;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.permissions = permissions;
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
        if (this.token != null) {
            return true;
        }
        return false;
    };
    this.getToken = function () {
        return this.token;
    };
    return this;
});
