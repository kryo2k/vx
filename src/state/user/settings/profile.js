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
          controller: 'AppUserSettingsProfileCtrl as $profile'
        }
      },

      resolve: {
        currentProfile: ['$auth', function ($auth) {
          return $auth.ready;
        }]
      }
    });
})
.controller('AppUserSettingsProfileCtrl', function ($scope, $auth, User, currentProfile) {

  var self = this;

  this.reset = (function (event, form) {
    this.model = angular.copy(currentProfile);
    if(form) form.$setPristine(true);
    if(event) event.preventDefault();
  }).bind(this);

  this.reset();

  this.submit = function (event, form) {
    form.$setSubmitted();
    return User.updateProfile(this.model).$promise
      .then(function () {
        form.$setPristine(true);
        return $auth.reloadProfileSoft();
      })
      .catch(function (err) {
        if(ErrorValidation.is(err)) {
          err.gradeForm($scope, form);
        }
        return err;
      });
  };
});
