angular.module('vx')
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
.controller('AppGuestContactCtrl', function ($scope, $dirtyForm, $modalMessage, $randomEmail, $randomWords, ErrorValidation, Contact) {

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

    return Contact.submit(this.model).$promise
      .then((function (result) {
        this.reset(null, form);
        form.$setPristine(true);
        $modalMessage(result.message);
        return result;
      }).bind(this))
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
