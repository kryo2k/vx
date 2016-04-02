angular.module('vx')
.service('$authPersist', function ($cookies, DOMAIN, DOMAINHTTPS) {
  var KEY_TOKEN = 'cvx-token';

  function cookieOpts(expires, path, domain, secure) {
    path = path || '/';
    domain = domain || DOMAIN;
    secure = (typeof secure === 'boolean') ? secure : DOMAINHTTPS;

    var o = {};
    if(path)    o.path    = path;
    if(domain)  o.domain  = domain;
    if(expires) o.expires = expires;
    if(secure)  o.secure  = secure;
    return o;
  }

  this.has = function() {
    return !!this.get();
  };
  this.clear = function() {
    $cookies.remove(KEY_TOKEN);
    return this;
  };
  this.get = function() {
    return $cookies.get(KEY_TOKEN);
  };
  this.set = function(v, expires) {
    $cookies.put(KEY_TOKEN, v, cookieOpts(expires));
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
