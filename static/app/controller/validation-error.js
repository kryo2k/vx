angular.module('coordinate-vx')
.controller('ValidationErrorCtrl', function ($scope) {
  var flagKey = 'validation';
  Object.defineProperties(this, {
    isString: {
      get: function () {
        return angular.isString(this.errors);
      }
    },
    isArray: {
      get: function () {
        return angular.isArray(this.errors);
      }
    },
    errorFlags: {
      get: function () {
        var input = this.input;
        if(!input || !input.hasModel) return null;
        return input.model.$error||null;
      }
    },
    errors: {
      get: function () {
        var input = this.input;
        if(!input || !input.hasModel) return null;

        var errs = input.model.$lastErrors||null
        if(!errs) {
          return errs;
        }

        return errs.message||null;
      }
    },
    hasErrors: {
      get: function () {
        var message = this.errors; // look for actual errors
        if(!message) return false;

        if(angular.isArray(message) || angular.isString(message)) {
          return message.length > 0;
        }

        return false;
      }
    },
    input: {
      get: function () {
        return $scope.$formInput;
      }
    },
    hasInput: {
      get: function () {
        var input = this.input;
        return !!input && input.hasModel;
      }
    }
  });

  this.clear = function () {
    if(!this.hasInput || !this.hasErrors) {
      return this;
    }

    var model = this.input.model;
    delete model.$lastErrors;
    model.$validate();

    return this;
  };
});
