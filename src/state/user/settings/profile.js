angular.module('vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.user.settings.profile', {
      url: '/profile',
      data: {
        title: 'Update Profile',
        description: 'Set the details on your account profile.'
      },

      views: {
        settingView: {
          templateUrl: 'state/user/settings/profile.html',
          controller: 'AppUserSettingsProfileCtrl'
        }
      }
    });
})
.controller('AppUserSettingsProfileCtrl', function ($scope) {
});
