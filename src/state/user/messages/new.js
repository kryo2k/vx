angular.module('vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.user.messages.new', {
      url: '/new',
      data: {
        title: 'New Message',
        description: 'Send a message to someone'
      },
      views: {
        messageView: {
          templateUrl: 'state/user/messages/new.html',
          controller: 'AppUserMessagesNewCtrl as $msgNew',
        }
      }
    });
})
.controller('AppUserMessagesNewCtrl', function ($scope, ErrorValidation, UserMessage) {

  this.reset = (function (event, form) {
    delete this.model;
    if(form) form.$setPristine(true);
    if(event) event.preventDefault();
  }).bind(this);

  this.reset();

  this.submit = function (event, form) {
    form.$setSubmitted();
    return UserMessage.send({
      id: this.model.to
    }, {
      message: this.model.message
    }).$promise
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
