angular.module('vx')
.factory('UserRecovery', function ($apiUrl, $resource) {
  return $resource($apiUrl('user/reset-pw/:controller/:id'), {
    controller: null,
    id: null
  }, {
    forgotPassword: {
      method: 'POST',
      params: {
        controller: ''
      }
    },
    changePassword: {
      method: 'POST'
    },
    validateId: {
      method: 'GET'
    }
  });
});
