angular.module('coordinate-vx')
.service('$authWatch', function ($rootScope, $auth) {
  return function () {

    var
    args = Array.prototype.slice.call(arguments),
    arg, cb = null, once = null;

    while((arg = args.shift()) !== undefined) {
      if(typeof arg === 'boolean' && once === null) {
        once = arg;
      }
      else if(angular.isFunction(arg) && cb === null) {
        cb = arg;
      }
    }

    if(!angular.isFunction(cb)) {
      return angular.noop;
    }

    var
    dereg;

    if(once) { // wrap in only once function
      var origCb = cb;
      cb = function () {
        dereg();
        origCb.apply(this, arguments);
      };
    }

    dereg = $rootScope.$watch(function () {
      return $auth.authenticated;
    }, function (cv, ov) {
      if(!cv) { // not authenticated
        return cb(false);
      }

      // authenticated, send profile
      return cb(true, $auth.profile);
    });

    // return de-registration function.
    return dereg;
  };
});