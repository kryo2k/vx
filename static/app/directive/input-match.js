angular.module('coordinate-vx')
.directive( 'inputMatch', function ($parse) {
  var id = 'inputMatch';

  return {
    restrict: 'A',
    require: '?ngModel',
    link: function (scope, el, attr, ctrl) {
      if(!ctrl) return;
      if(!attr[id]) return;

      var
      matchInput = $parse(attr[id]),
      validator  = function (value) {
        var current = matchInput(scope);
        ctrl.$setValidity('match', value === current);
        return current;
      };

      ctrl.$parsers.unshift(validator);
      ctrl.$formatters.unshift(validator);
      attr.$observe(id, function () { validator(ctrl.$viewValue); });
    }
  };
});