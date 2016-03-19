angular.module('coordinate-vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.guest.forgot', {
      url: '/forgot',
      templateUrl: 'app/tpl/guest/forgot.html',
      controller: 'AppGuestForgotCtrl as $forgot',
      data: {
        title: 'Forgot Password',
        description: 'Recover your account access.'
      }
    });
})
.controller('AppGuestForgotCtrl', function ($scope) {
  this.submit = function (event, form) {
    console.log('submitting form:', form);
  };
  this.reset = function (event, form) {
    delete this.model;
  };
});