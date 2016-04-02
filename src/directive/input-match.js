angular.module('vx')
.directive( 'inputMatch', function ($parse) {
  var id = 'inputMatch';

  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, el, attr, ctrl) {
      var
      watchers = {};

      if(!attr[id]) return;

      var
      match = false,
      validate = function (b) {
        if(!angular.isFunction(match)) {
          return false;
        }

        var a = match(scope);

        return ctrl.$isEmpty(a) || a === b;
      };

      ctrl.$validators.match = function (modelValue, viewValue) {
        return validate(viewValue);
      };

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
