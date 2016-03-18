angular.module('coordinate-vx')
.service('$authPersist', function ($cookieStore) {
  var KEY_TOKEN = 'cvx-token';

  this.has = function() {
    return !!this.get();
  };
  this.clear = function() {
    $cookieStore.remove(KEY_TOKEN);
    return this;
  };
  this.get = function() {
    return $cookieStore.get(KEY_TOKEN);
  };
  this.set = function(v) {
    $cookieStore.put(KEY_TOKEN, v);
    return this;
  };

  Object.defineProperties(this, {
    token: {
      get: this.get.bind(this)
    },
    authenticated: {
      get: this.has.bind(this)
    }
  });
});