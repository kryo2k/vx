angular.module('coordinate-vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.guest.contact', {
      url: '/contact',
      templateUrl: 'state/guest/contact.html',
      controller: 'AppGuestContactCtrl as $contact',
      data: {
        title: 'Contact Us',
        description: 'Get in touch with our support team.'
      }
    });
})
.controller('AppGuestContactCtrl', function ($scope, $dirtyForm, $modalMessage, $randomEmail, $randomWords) {

  this.quickFill = function (form) {
    var
    m = this.model,
    ident = $randomEmail();

    if(!m) {
      m = this.model = {};
    }

    m.name = ident.toString();
    m.email = ident.toEmail();
    m.subject = $randomWords(10);
    m.message = $randomWords(30);
    m.$wasPrefilled = true; // mark so view can respond

    $dirtyForm(form);
  };

  this.submit = function (event, form) {
    form.$setSubmitted();
    $modalMessage('Contact feature is coming soon', 'Coming Soon');
  };

  this.reset = function (event, form) {
    delete this.model;
  };
});
