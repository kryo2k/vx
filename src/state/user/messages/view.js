angular.module('vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.user.messages.view', {
      url: '/view/:message',
      templateUrl: 'state/user/messages/view.html',
      controller: 'AppUserMessagesViewCtrl',
      data: {
        title: 'Message',
        description: 'A page for a single message'
      },
      views: {
        messageView: {
          templateUrl: 'state/user/messages/view.html',
          controller: 'AppUserMessagesViewCtrl as $msgView',
        }
      }
    });
})
.controller('AppUserMessagesViewCtrl', function ($scope, UserMessage) {
});
