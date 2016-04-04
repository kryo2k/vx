angular.module('vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.user.messages.conversations', {
      url: '/conversations',
      templateUrl: 'state/user/messages/conversations.html',
      controller: 'AppUserMessagesConversationsCtrl',
      data: {
        title: 'Conversations',
        description: false
      },
      views: {
        messageView: {
          templateUrl: 'state/user/messages/conversations.html',
          controller: 'AppUserMessagesConversationsCtrl as $msgConversations',
        }
      }
    });
})
.controller('AppUserMessagesConversationsCtrl', function ($scope) {
});
