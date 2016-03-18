angular.module('coordinate-vx')
.factory('ErrorValidation', function (ErrorAlert) {
  function ErrorValidation (message, errors, title) {
    ErrorAlert.call(this, message, title||'Validation Error');
    this.errors  = errors;
  }

  // extend ErrorAlert
  ErrorValidation.prototype = Object.create(ErrorAlert.prototype);
  ErrorValidation.prototype.constructor = ErrorValidation;

  ErrorValidation.is = function (v) {
    return angular.isObject(v) && (v instanceof ErrorValidation);
  };

  return ErrorValidation;
});