angular.module('vx')
.factory('UserMessage', function ($apiUrl, $resource) {
  return $resource($apiUrl('user/message/:controller/:id'), {
    controller: null,
    id: null
  }, {
    inbox: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'inbox'
      }
    },
    inboxFrom: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'inbox',
        // id: '=' // senderId (userId)
      }
    },
    sent: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'sent'
      }
    },
    sentTo: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'sent',
        // id: '=' // receiverId (userId)
      }
    },
    conversation: {
      method: 'GET',
      // isArray: true,
      params: {
        controller: 'convo',
        id: '@id' // userId
      }
    },
    read: {
      method: 'GET',
      params: {
        controller: '@id' // messageId
      }
    },
    send: {
      method: 'POST',
      params: {
        controller: '@id' // receiverId (userId)
      }
    },
    remove: {
      method: 'DELETE',
      params: {
        controller: '@id' // messageId
      }
    }
  });
});
