angular.module('vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.user.messages.received', {
      url: '/received',
      data: {
        title: 'Received Messages',
        description: false
      },
      views: {
        messageView: {
          templateUrl: 'state/user/messages/received.html',
          controller: 'AppUserMessagesReceivedCtrl as $msgReceived',
        }
      }
    });
})
.controller('AppUserMessagesReceivedCtrl', function ($scope) {
});
