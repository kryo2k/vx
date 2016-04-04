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
          controller: 'AppUserSettingsChangePassswordCtrl as $changePassword'
        }
      }
    });
})
.controller('AppUserSettingsChangePassswordCtrl', function ($scope, User, ErrorValidation) {

  this.reset = (function (event, form) {
    delete this.model;
    if(form) form.$setPristine(true);
    if(event) event.preventDefault();
  }).bind(this);

  this.reset();

  this.submit = function (event, form) {
    form.$setSubmitted();
    return User.changePassword(this.model).$promise
      .then((function () {
        form.$setPristine(true);
        return this.reset(null, form);
      }).bind(this))
      .catch(function (err) {
        if(ErrorValidation.is(err)) {
          err.gradeForm($scope, form);
        }
        return err;
      });
  };
});
