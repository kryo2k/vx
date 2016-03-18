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
.controller('AppGuestSignupCtrl', function ($scope, $guestOnly) {

  $guestOnly($scope);

  this.submit = function (event, form) {
    console.log('submitting form:', form);
  };
  this.reset = function (event, form) {
    delete this.model;
  };
});