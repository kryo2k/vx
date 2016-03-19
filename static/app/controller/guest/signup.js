angular.module('coordinate-vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.guest.signup', {
      url: '/signup',
      templateUrl: 'app/tpl/guest/signup.html',
      controller: 'AppGuestSignupCtrl as $signup',
      data: {
        title: 'Signup',
        description: 'Create a new account'
      }
    });
})
.controller('AppGuestSignupCtrl', function ($scope, $guestOnly, User, $randomEmail, $randomPassword) {

  $guestOnly($scope);

  this.model = {};

  this.quickFill = function (form) {
    var
    m = this.model,
    ident = $randomEmail();

    m.name = ident.toString();
    m.email = ident.toEmail();
    m.password = $randomPassword();
    m.passwordConfirm = String(m.password);

    m.$wasPrefilled = true;

    form.$setDirty();
  };

  this.submit = function (event, form) {
    console.log('submitting form:', form);
    return User.signup(this.model).$promise
      .then(function(result){
        console.log(result);
        return result;
      })
      .catch(function(err){
        console.error(err);
        return err;
      });
  };
  this.reset = function (event, form) {
    this.model = {};
  };
});
