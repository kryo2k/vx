angular.module('vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.user.messages.sent', {
      url: '/sent',
      data: {
        title: 'Sent Messages',
        description: false
      },
      views: {
        messageView: {
          templateUrl: 'state/user/messages/sent.html',
          controller: 'AppUserMessagesSentCtrl as $msgSent',
        }
      }
    });
})
.controller('AppUserMessagesSentCtrl', function ($scope) {
});
