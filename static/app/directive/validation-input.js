angular.module('coordinate-vx')
.directive('validationInput', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, el, attr, ctrl) {
      var toggleValid = function () {
        delete ctrl.$lastErrors;
        ctrl.$validate();
      };

      el.on('click', toggleValid);
    }
  };
});
