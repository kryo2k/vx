angular.module('coordinate-vx')
.directive('validationFeedback', function ($compile) {
  return {
    restrict: 'E',
    replace: true,
    require: '^formInput',
    templateUrl: 'directive/validation-feedback.html',
    scope: {},
    link: function (scope, el, attr, input) {
      scope.$formInput = input;
    }
  };
})
