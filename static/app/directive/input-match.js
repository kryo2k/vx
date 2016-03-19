angular.module('coordinate-vx')
.directive( 'inputMatch', function ($parse) {
  var id = 'inputMatch';

  return {
    restrict: 'A',
    require: ['ngModel', '^?formReset'],
    link: function (scope, el, attr, ctrls) {
      var
      ctrl = ctrls[0],
      reset = ctrls[1],
      watchers = {};

      if(!attr[id]) return;

      var
      match = false,
      cleanUp = function () {
        ctrl.$setValidity('match', true);
      },
      validate = function (b) {
        if(!angular.isFunction(match)) {
          return false;
        }

        return match(scope) === b;
      };

      ctrl.$validators.match = function (modelValue, viewValue) {
        return validate(viewValue);
      };

      if(reset) { // clean up dereg on destroy
        scope.$on('$destroy', reset.addListener(cleanUp));
      }

      var lwatcher = null;

      attr.$observe(id, function (toEqual) {
        match = $parse(toEqual);

        if(lwatcher) lwatcher();

        // watch for changes on model we're supposed to match
        lwatcher = scope.$watch(toEqual, ctrl.$validate.bind(ctrl));
      });
    }
  };
});
