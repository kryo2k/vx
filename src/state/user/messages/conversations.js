angular.module('vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.user.messages.conversations', {
      url: '/conversations/:senderId',
      templateUrl: 'state/user/messages/conversations.html',
      controller: 'AppUserMessagesConversationsCtrl',
      data: {
        title: 'Conversations',
        description: 'Your messages between users'
      },
      views: {
        messageView: {
          templateUrl: 'state/user/messages/conversations.html',
          controller: 'AppUserMessagesConversationsCtrl as $msgConversations',
        }
      },
      resolve: {
        messages : ['UserMessage', function (UserMessage) {
          return UserMessage.inbox({}, {}).$promise;
        }],
        focusConversation : ['UserMessage', '$stateParams', function (UserMessage, $stateParams) {
          if(!$stateParams || !$stateParams.senderId) {
            return null;
          }

          return UserMessage.conversation({}, { id: $stateParams.senderId }).$promise;
        }]
      }
    });
})
.controller('AppUserMessagesConversationsCtrl', function ($scope, UserMessage, messages, focusConversation) {
  $scope.messages = messages;
  $scope.focusConvo = focusConversation;
});
