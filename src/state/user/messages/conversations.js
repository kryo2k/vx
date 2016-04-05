angular.module('vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.user.messages.conversations', {
      url: '/conversations/:senderId/:messageId',
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
        conversations : ['UserMessage', function (UserMessage) {
          return UserMessage.inbox({}, {}).$promise;
        }],
        conversation : ['UserMessage', 'PaginateLazy', '$stateParams', function (UserMessage, PaginateLazy, $stateParams) {
          if(!$stateParams || !$stateParams.senderId) {
            return null;
          }

          return new PaginateLazy(UserMessage.conversation.bind(UserMessage), {
            id: $stateParams.senderId
          });
        }],
        message: ['UserMessage', '$stateParams', function (UserMessage, $stateParams) {
          if(!$stateParams || !$stateParams.messageId) {
            return null;
          }

          return UserMessage.read({ id: $stateParams.messageId }).$promise;
        }]
      }
    });
})
.controller('AppUserMessagesConversationsCtrl', function ($scope, PaginateLazy, UserMessage, conversations, conversation, message) {
  Object.defineProperties(this, {
    length: {
      get: function () {
        return !conversations ? 0 : conversations.length;
      }
    },
    conversations: {
      get: function () {
        return conversations;
      }
    },
    conversation: {
      get: function () {
        return conversation;
      }
    },
    message: {
      get: function () {
        return message;
      }
    },
    lastQueryData: {
      get: function () {
        return (!conversation || !conversation.lastData) ? null : conversation.lastData;
      }
    },
    lastQueryParams: {
      get: function () {
        return (!conversation || !conversation.lastParams) ? null : conversation.lastParams;
      }
    },
    conversationWith: {
      get: function () {
        return !this.lastQueryParams ? null : this.lastQueryParams.id;
      }
    },
    conversationRecords: {
      get: function () {
        return !conversation ? null : conversation.records;
      }
    },
    conversationSelf: {
      get: function () {
        return !this.lastQueryData ? null : this.lastQueryData.self;
      }
    },
    conversationPartner: {
      get: function () {
        return !this.lastQueryData ? null : this.lastQueryData.partner;
      }
    }
  });

  var
  cacheMessages = {},
  cachePromises = {};

  this.read = function (messageId) {
    if(cacheMessages.hasOwnProperty(messageId)) {
      return cacheMessages[messageId];
    }
    else if(!cachePromises.hasOwnProperty(messageId)) {
      cachePromises[messageId] = UserMessage.read({ id: messageId }).$promise
        .then(function (msg) {
          cacheMessages[messageId] = msg.content;
          delete cachePromises[messageId];
          return msg.content;
        });
    }

    return null;
  };

  this.isFocused = function (convo) {
    if(!convo || !convo.from) return false;
    return this.conversationWith === convo.from._id && this.lastQueryData;
  };


  // var
  // pushMarkReadQueue = [],
  // notifications = this.source = new PaginateLazy(UserMessage.query.bind(UserNotification), {
  //   unreadOnly: 0,
  //   readOnly: 0
  // });


});
