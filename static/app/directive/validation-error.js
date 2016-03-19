angular.module('coordinate-vx')
.directive('validationError', function () {
  return {
    restrict: 'E',
    transclude: true,
    require: ['validationError', '^formInput', '^?formReset'],
    templateUrl: 'app/tpl/validation-error.html',
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
});
