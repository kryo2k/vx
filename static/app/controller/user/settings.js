angular.module('coordinate-vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.user.settings', {
      url: '/settings',
      templateUrl: 'app/tpl/user/settings.html',
      controller: 'AppUserSettingsCtrl',
      data: {
        title: 'Settings',
        description: 'Configuration for your account'
      }
    });
})
.controller('AppUserSettingsCtrl', function ($scope) {
});
