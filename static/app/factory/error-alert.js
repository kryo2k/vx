angular.module('coordinate-vx')
.factory('ErrorAlert', function () {
  function ErrorAlert (message, title) {
    this.message = message;
    this.title = title||'System Error';
  }

  ErrorAlert.is = function (v) {
    return angular.isObject(v) && (v instanceof ErrorAlert);
  };

  return ErrorAlert;
});