angular.module('coordinate-vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.guest.contact', {
      url: '/contact',
      templateUrl: 'app/tpl/guest/contact.html',
      controller: 'AppGuestContactCtrl as $contact',
      data: {
        title: 'Contact Us',
        description: 'Get in touch with our support team.'
      }
    });
})
.controller('AppGuestContactCtrl', function ($scope) {
  this.submit = function (event, form) {
    console.log('submitting form:', form);
  };
  this.reset = function (event, form) {
    delete this.model;
  };
});