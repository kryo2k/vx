angular.module('vx')
.directive('validationInput', function ($debounce) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, el, attr, ctrl) {
      var
      clearErrors = function () {
        delete ctrl.$lastErrors;
        ctrl.$validate();
      };

      scope.$watch(function () { return ctrl.$viewValue; }, $debounce(function (viewValue) {
        var errs = ctrl.$lastErrors||false;

        if(!errs || !errs.hasOwnProperty('original')) {
          return false;
        }

        var changed = (viewValue !== errs.original);

        if(changed) {
          clearErrors();
        }

        return changed;
      }, 50, 100));
    }
  };
});
