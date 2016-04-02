angular.module('vx')
.directive('navigation', function () {
  return {
    replace: true,
    transclude: true,
    controller: 'NavigationCtrl as $navigation',
    templateUrl: 'directive/navigation.html'
  };
})
.controller('NavigationCtrl', function ($auth, $scope, DURATION_SHORT) {
  $scope.durationOpts = angular.extend({}, DURATION_SHORT, {
    // precise: true
  });
  this.logout = function (event) {
    $auth.logout();
  };
});
