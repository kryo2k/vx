angular.module('vx')
.factory('AuthInterceptor', function (ErrorBadToken, $rootScope, $q, $authPersist) {
  return {

    request: function (config) { // add authorization token to headers if authenticated
      config.headers = config.headers || {};

      if ($authPersist.authenticated) {
        config.headers.Authorization = $authPersist.token;
      }

      return config;
    },

    responseError: function (err) {
      if(!ErrorBadToken.is(err)) {
        return $q.reject(err);
      }

      // clear any persisting auth token
      $authPersist.clear();

      // broadcast that the session was expired (handle in a different thread, after clearing token)
      $rootScope.$broadcast('$sessionExpired', err);

      return $q.reject(err); // cascade error downstream
    }
  };
});
