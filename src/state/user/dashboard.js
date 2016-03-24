angular.module('coordinate-vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.user.dashboard', {
      url: '/dashboard',
      templateUrl: 'state/user/dashboard.html',
      controller: 'AppUserDashboardCtrl',
      data: {
        title: 'Dashboard',
        description: 'Account overview'
      }
    });
})
.controller('AppUserDashboardCtrl', function ($scope) {
});
