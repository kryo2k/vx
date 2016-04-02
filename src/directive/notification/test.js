angular.module('vx')
.directive( 'notificationTest', function () {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: 'directive/notification/test.html',
    scope: {
      options: '='
    }
  };
});
