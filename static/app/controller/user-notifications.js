angular.module('coordinate-vx')
.controller('UserNotificationsCtrl', function ($scope, $rootScope, $realTime) {

  console.log('user notification subscribing');

  $realTime.subscribe('vx.user.notifications', function (count) {
    console.log('vx.user.notifications', arguments);
  });
});
