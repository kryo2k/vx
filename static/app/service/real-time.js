angular.module('coordinate-vx')
.config(function ($wampProvider, WAMP_URL, WAMP_REALM) {
  $wampProvider.init({
    url: WAMP_URL,
    realm: WAMP_REALM,
    authmethods: ['wampcra']
  });
})
.service('$realTime', function ($wamp, $auth, $authPersist, $rootScope) {

  var
  running = false;

  // locally bind these functions
  this.subscribe      = $wamp.subscribe.bind($wamp);
  this.unsubscribe    = $wamp.unsubscribe.bind($wamp);
  this.publish        = $wamp.publish.bind($wamp);
  this.register       = $wamp.register.bind($wamp);
  this.unregister     = $wamp.unregister.bind($wamp);
  this.call           = $wamp.call.bind($wamp);

  // can't use native subscribe on scope, borks up the returned subscription:
  // this.subscribeScope = $wamp.subscribeOnScope.bind($wamp);
  this.subscribeScope = (function (scope, channel, callback) {
    return this.subscribe(channel, callback).then(function (subscription) {
      scope.$on('$destroy', function () {
        return subscription.unsubscribe();
      });

      return subscription;
    });
  }).bind($wamp);

  this.start = function () {
    if(running) return this;
    running = true;
    $wamp.setAuthId($authPersist.token); // token is our auth id
    $wamp.open();
    return this;
  };

  this.stop = function () {
    if(!running) return this;
    running = false;
    $wamp.close();
    return this;
  };

  $rootScope.$on("$wamp.onchallenge", function (event, data) {
    var
    extra = data.extra,
    derived = autobahn.auth_cra.derive_key($auth.profile._id, extra.salt, extra.iterations, extra.keylen);
    return data.promise.resolve(autobahn.auth_cra.sign(derived, extra.challenge));
  });
})
.run(function ($realTime, $authWatch) {
  $authWatch((function (authenticated) { !!authenticated ? this.start() : this.stop(); }).bind($realTime));
});
