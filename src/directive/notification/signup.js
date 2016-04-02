angular.module('vx')
.directive( 'notificationSignup', function () {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: 'directive/notification/signup.html',
    scope: {
      options: '='
    }
  };
});
