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
.controller('AppUserMessagesNewCtrl', function ($scope) {
});
