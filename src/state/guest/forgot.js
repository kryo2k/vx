angular.module('vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.guest.forgot', {
      url: '/forgot',
      templateUrl: 'state/guest/forgot.html',
      controller: 'AppGuestForgotCtrl as $forgot',
      data: {
        title: 'Forgot Password',
        description: 'Recover your account access.'
      }
    });
})
.controller('AppGuestForgotCtrl', function ($scope, $modalMessage, $dirtyForm, $randomEmail, ErrorValidation, UserRecovery) {

  this.quickFill = function (form) {
    var
    m = this.model,
    ident = $randomEmail();

    if(!m) {
      m = this.model = {};
    }

    m.email = ident.toEmail();
    m.$wasPrefilled = true; // mark so view can respond

    $dirtyForm(form);
  };

  this.submit = function (event, form) {
    form.$setSubmitted();

    return UserRecovery.forgotPassword(this.model).$promise
      .then((function (result) {
        this.reset(null, form);
        form.$setPristine(true);
        $modalMessage(result.message);
        return result;
      }).bind(this))
      .catch((function (err) {
        if(ErrorValidation.is(err)) {
          err.gradeForm($scope, form);
        }
        return err;
      }).bind(this));
  };

  this.reset = function (event, form) {
    delete this.model;
  };
});
