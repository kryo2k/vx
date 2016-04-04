angular.module('vx')
.config(function ($wampProvider, WAMP_URL, WAMP_REALM) {
  $wampProvider.init({
    url: WAMP_URL,
    realm: WAMP_REALM,
    authmethods: ['wampcra']
  });
})
.factory('RealTimeLog', function (Log) {
  function RealTimeLog() {
    Log.apply(this, arguments);
  }

  RealTimeLog.prototype = Object.create(Log);
  RealTimeLog.prototype.constructor = RealTimeLog;

  RealTimeLog.prototype.item = function (v) {
    return { cls: v.c, message: v.m, date: new Date() };
  };

  return RealTimeLog;
})
.service('$realTime', function ($q, $wamp, $auth, $authPersist, $rootScope, $filter, RealTimeLog) {

  var
  filterEllipsis = $filter('ellipsis'),
  running = false,
  lPushDate = null,
  log = new RealTimeLog([], 5, true),
  logWrapFn = (function (message, cls, fn) {
    return function () {
      // console.log('CALLING', this, arguments);
      var
      msg = message;

      if(angular.isFunction(message)) {
        msg = message.apply(this, arguments);
      }

      log.add({ m: msg, c: cls });

      return fn.apply(this, arguments);
    };
  }).bind(this);

  Object.defineProperties(this, {
    log: {
      get: function () {
        return log.records;
      }
    },
    lastPushDate: {
      get: function () {
        return lPushDate;
      }
    }
  });

  // locally bind these functions
  // this.subscribe      = logWrapFn(function (c) { return 'Subscribing ('+c+')'; }, '', $wamp.subscribe.bind($wamp));
  // this.unsubscribe    = logWrapFn(function (z) { return 'Unsubscribing ('+z.topic+')'; }, '', $wamp.unsubscribe.bind($wamp));
  this.publish        = logWrapFn('Publishing', '', $wamp.publish.bind($wamp));
  this.register       = logWrapFn('Registering', '', $wamp.register.bind($wamp));
  this.unregister     = logWrapFn('Unregistering', '', $wamp.unregister.bind($wamp));
  this.call           = logWrapFn('Calling function', '', $wamp.call.bind($wamp));
  this.open           = logWrapFn('Connection opening..',  'success', $wamp.open.bind($wamp));
  this.close          = logWrapFn('Connection closing..',  'danger',  $wamp.close.bind($wamp));

  this.subscribe = function (channel, fn) {
    var
    subscriptionId = null,
    ellipSubId = null;

    return $wamp.subscribe(channel, function (args, meta) {
      log.add({ m: 'Subscription ('+channel+':'+ellipSubId+') got data: ' + JSON.stringify(args) + ' meta: ' + JSON.stringify(meta) });
      return fn.apply(this, arguments);
    })
      .then(function(res){
        ellipSubId = filterEllipsis(subscriptionId = res.id);
        log.add({ m: 'Subscribed to channel ('+channel+') with id ('+ellipSubId+').' });
        return res;
      }, function(err){
        log.add({ m: 'Got error ('+err+') while subscribing to channel ('+channel+').', c: 'danger' })
        return res;
      });
  };

  this.unsubscribe = function (subscription) {
    if(!subscription) {
      return $q.when(false);
    }
    var
    channel = subscription.topic,
    id = subscription.id,
    eid = filterEllipsis(id);

    return $wamp.unsubscribe(subscription)
      .then(function(res){
        log.add({ m: 'Unsubscribed from channel ('+channel+') id ('+eid+').' });

        if(angular.isObject(subscription) && angular.isFunction(subscription.$scopeWatchDeregistration)) {
          subscription.$scopeWatchDeregistration();
          delete subscription.$scopeWatchDeregistration;
        }

        return res;
      }, function(err){
        log.add({ m: 'Got error ('+err+') while unsubscribing channel ('+channel+').', c: 'danger' })
        return res;
      });
  };

  // can't use native subscribe on scope, borks up the returned subscription:
  // this.subscribeScope = $wamp.subscribeOnScope.bind($wamp);
  this.subscribeScope = function (scope, channel, callback) {
    return this.subscribe(channel, callback).then(function (subscription) {
      subscription.$scopeWatchDeregistration = scope.$on('$destroy', function () {
        if(!subscription || !subscription.active) return;
        log.add({ m: 'Auto-unsubscribing scope from channel ('+channel+')', c: 'warning' });
        return subscription.unsubscribe();
      });
      return subscription;
    });
  };

  this.start = function () {
    if(running) return this;
    log.add({ m: 'Starting real-time wamp socket.', c: 'success' });
    running = true;
    $wamp.setAuthId($authPersist.token); // token is our auth id
    $wamp.open();
    return this;
  };

  this.stop = function () {
    if(!running) return this;
    log.add({ m: 'Stopping real-time wamp socket.', c: 'danger' });
    running = false;
    lPushDate = null;
    $wamp.close();
    return this;
  };

  // received push timestamp from server:
  this.subscribe('vx.time', function (args) {
    lPushDate = new Date(args[0]);
  });

  $rootScope.$on("$wamp.open", function (z) {
    log.add({ m: 'Connection opened.', c: 'success' });
  });
  $rootScope.$on("$wamp.close", function (z) {
    log.add({ m: 'Connection closed.', c: 'danger' });
  });

  $rootScope.$on("$wamp.onchallenge", function (event, data) {
    log.add({ m: 'Authenticating as '+$auth.profile.name+'..', c: 'info' });

    var
    extra = data.extra,
    derived = autobahn.auth_cra.derive_key($auth.profile._id, extra.salt, extra.iterations, extra.keylen);
    return data.promise.resolve(autobahn.auth_cra.sign(derived, extra.challenge));
  });
})
.run(function ($realTime, $authWatch) {
  $authWatch((function (authenticated) { !!authenticated ? this.start() : this.stop(); }).bind($realTime));
});
