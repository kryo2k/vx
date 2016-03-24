angular.module('coordinate-vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.guest.signup', {
      url: '/signup',
      templateUrl: 'state/guest/signup.html',
      controller: 'AppGuestSignupCtrl as $signup',
      data: {
        title: 'Signup',
        description: 'Create a new account'
      }
    });
})
.controller('AppGuestSignupCtrl', function ($scope, $dirtyForm, $guestOnly, $auth, $randomEmail, $randomWords, ErrorValidation) {

  $guestOnly($scope);

  this.quickFill = function (form) {
    var
    m = this.model,
    ident = $randomEmail();

    if(!m) {
      m = this.model = {};
    }

    m.name = ident.toString();
    m.email = ident.toEmail();
    m.password = $randomWords();
    m.passwordConfirm = String(m.password);
    m.$wasPrefilled = true; // mark so view can respond

    $dirtyForm(form);
  };

  this.submit = function (event, form) {
    form.$setSubmitted();
    return $auth.signup(this.model)
      .catch(function (err) {
        if(ErrorValidation.is(err)) {
          err.gradeForm($scope, form);
        }
        return err;
      });
  };
  this.reset = function (event, form) {
    delete this.model;
  };
});
