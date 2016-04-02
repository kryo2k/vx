angular.module('vx')
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

  ErrorValidation.normalizeError = function (err, key) {
    return {};
  };

  ErrorValidation.prototype.gradeForm = function (scope, form) {
    if(!form || !this.errors) return this;

    var errs = this.errors||{};

    Object.keys(errs).forEach(function (path) {
      if(!form.hasOwnProperty(path)) {
        return;
      }

      var model = form[path];
      model.$lastErrors = errs[path];
      model.$validate();
    });

    return this;
  };

  return ErrorValidation;
});
