angular.module('coordinate-vx')
.directive('validationError', function () {
  return {
    restrict: 'E',
    transclude: true,
    require: ['validationError', '^formInput', '^?formReset'],
    templateUrl: 'directive/validation-error.html',
    controller: 'ValidationErrorCtrl as $validation',
    scope: {},
    link: function (scope, el, attr, ctrls) {
      var
      self = ctrls[0],
      input = ctrls[1],
      reset = ctrls[2];

      scope.$formInput = input;

      if(reset) { // clean up dereg on destroy
        scope.$on('$destroy', reset.addListener(self.clear.bind(self)));
      }

      scope.$watch(function () { return input.model; }, function (model) {
        if(!model || model.$validators.hasOwnProperty('validation')) {
          return;
        }

        model.$validators.validation = function () {
          return !self.hasErrors;
        };

        model.$validate();
      });
    }
  };
})
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
