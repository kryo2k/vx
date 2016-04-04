angular.module('vx')
.directive( 'notificationMessage', function () {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: 'directive/notification/message.html',
    scope: {
      options: '='
    }
  };
});
