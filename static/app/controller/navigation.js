angular.module('coordinate-vx')
.controller('NavigationCtrl', function ($auth, $scope, DURATION_SHORT) {
  $scope.durationOpts = angular.extend({}, DURATION_SHORT, {
    // precise: true
  });
  this.logout = function (event) {
    $auth.logout();
  };
});