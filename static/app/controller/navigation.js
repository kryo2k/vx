angular.module('coordinate-vx')
.controller('NavigationCtrl', function ($auth, $scope) {
  this.logout = function (event) {
    $auth.logout();
  };
});