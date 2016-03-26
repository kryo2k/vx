angular.module('coordinate-vx')
.factory('User', function ($apiUrl, $resource) {
  return $resource($apiUrl('user/:controller'), {
    controller: null,
    id: null
  }, {
    login: {
      method: 'POST',
      params: {
        controller: 'login'
      }
    },
    signup: {
      method: 'POST',
      params: {
        controller: 'signup'
      }
    },
    tokenInfo: {
      method: 'GET',
      params: {
        controller: 'token-info'
      }
    },
    tokenExtend: {
      method: 'GET',
      params: {
        controller: 'token-extend'
      }
    },
    getProfile: {
      method: 'GET',
      params: {
        controller: 'profile'
      }
    },
    updateProfile: {
      method: 'POST',
      params: {
        controller: 'profile'
      }
    },
    changePassword: {
      method: 'POST',
      params: {
        controller: 'change-password'
      }
    },
    notificationTest: {
      method: 'POST',
      params: {
        controller: 'notification-test'
      }
    }
  });
});
