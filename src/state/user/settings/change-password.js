angular.module('vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.user.settings.change-password', {
      url: '/change-password',
      data: {
        title: 'Change your password',
        description: 'Update the current password on your account.'
      },

      views: {
        settingView: {
          templateUrl: 'state/user/settings/change-password.html',
          controller: 'AppUserSettingsChangePassswordCtrl'
        }
      }
    });
})
.controller('AppUserSettingsChangePassswordCtrl', function ($scope) {
});
