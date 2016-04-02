angular.module('vx')
.factory('UserNotification', function ($apiUrl, $resource) {
  return $resource($apiUrl('user/notification/:controller'), {
    controller: null,
    id: null
  }, {
    query: {
      method: 'GET',
      params: {
      },
      isArray: false
    },
    markRead: {
      method: 'POST',
      params: {
        controller: 'mark-read'
      },
    },
    count: {
      method: 'GET',
      params: {
        controller: 'count'
      },
    }
  });
});
