angular.module('coordinate-vx')
.directive('userNotifications', function () {
  return {
    restrict: 'A',
    transclude: true,
    replace: true,
    templateUrl: 'app/tpl/user-notifications.html',
    controller: 'UserNotificationsCtrl as $notifications'
  };
})
