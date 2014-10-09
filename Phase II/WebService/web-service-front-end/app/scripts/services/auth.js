angular.module('webServiceApp').factory('AuthService', function ($http, Session) {
  var authService = {};

  authService.login = function (credentials) {
    console.log("About to post...");
    return $http
      .post('/login', credentials).
        success(function(response, status) {
          Session.create(response.data.id, response.data.user.id,
          response.data.user.role);
          return response.data.user;
          console.log("Post Success.");
        }).
        error(function(response, status) {
          console.log("Post Failed.");
        });
  };

  authService.isAuthenticated = function () {
    return !!Session.userId;
  };

  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
  };

  return authService;
})

angular.module('webServiceApp').service('Session', function () {
  this.create = function (sessionId, userId, userRole) {
    this.id = sessionId;
    this.userId = userId;
    this.userRole = userRole;
  };
  this.destroy = function () {
    this.id = null;
    this.userId = null;
    this.userRole = null;
  };
  return this;
});
