angular.module('coordinate-vx')
.factory('ErrorBadToken', function () {
  function ErrorBadToken (message) {
    this.message = message;
  }

  ErrorBadToken.is = function (v) {
    return angular.isObject(v) && (v instanceof ErrorBadToken);
  };

  return ErrorBadToken;
});