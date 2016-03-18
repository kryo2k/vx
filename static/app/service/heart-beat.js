angular.module('coordinate-vx')
.service('$heartBeat', function ($q, $timeout, $auth) {

  var
  running = false,
  interval = 150000,
  warnThreshold = 60000,
  idleThreshold = 30000,
  warnGraceMs = 5000,
  checking = false,
  checkPromise = null,
  longTerm = false,
  lastCheck = null,
  lastTouch = null,
  lastError = null,
  expireAt = null,
  issuedAt = null,
  timeout = null;

  function roundSec (n) {
    return Math.round(n / 1000);
  }

  function validThreshold (n) {
    return angular.isNumber(v) && !isNaN(v) && isFinite(v) && v >= 0
  }

  Object.defineProperties(this, {
    interval: {
      get: function () {
        return interval;
      },
      set: function (v) {
        if(!validThreshold(v)) return;

        interval = v;
        this.resetTimeout();
      }
    },
    warnThreshold: {
      get: function () {
        return warnThreshold;
      },
      set: function (v) {
        if(!validThreshold(v)) return;
        warnThreshold = v;
      }
    },
    idleThreshold: {
      get: function () {
        return idleThreshold;
      },
      set: function (v) {
        if(!validThreshold(v)) return;
        idleThreshold = v;
      }
    },
    longTerm: {
      get: function () { return longTerm; },
      set: function (v) { longTerm = !!v; }
    },
    lastCheck: {
      get: function () {
        return lastCheck;
      }
    },
    lastTouch: {
      get: function () {
        return lastTouch;
      }
    },
    expireAt: {
      get: function () {
        return expireAt;
      }
    },
    ttlMs: {
      get: function () {
        if(!this.expireAt) return Infinity;
        return this.expireAt.getTime() - Date.now();
      }
    },
    ttlSec: {
      get: function () {
        return roundSec(this.ttlMs);
      }
    },
    idleMs: {
      get: function () {
        if(!lastTouch) return Infinity;
        return Date.now() - lastTouch.getTime();
      }
    },
    idleSec: {
      get: function () {
        return roundSec(this.idleMs);
      }
    },
    nextCheckInMs: {
      get: function () {
        if(!lastCheck) return Infinity;
        return interval - (Date.now() - lastCheck.getTime());
      }
    },
    nextCheckInSec: {
      get: function () {
        return roundSec(this.nextCheckInMs);
      }
    },
    issuedAt: {
      get: function () {
        return issuedAt;
      }
    },
    isWarning: {
      get: function () {
        return this.ttlMs <= this.warnThreshold;
      }
    },
    isWarningGraced: {
      get: function () {
        return this.ttlMs <= (this.warnThreshold + warnGraceMs); // (this.idleThreshold - this.idleMs)
      }
    },
    isIdle: {
      get: function () {
        return this.idleMs >= this.idleThreshold;
      }
    },
    running: {
      get: function () {
        return running;
      }
    },
    checking: {
      get: function () {
        return checking;
      }
    },
    $promise: {
      get: function () {
        return $q.when(checkPromise);
      }
    }
  });

  var
  loop = (function () {
    if(!running||checking) {
      return this.resetTimeout();
    }

    checking = true;
    checkPromise = $auth.accessInfo()
      .then(function (results) {
        expireAt = new Date(results.expireDate);
        issuedAt = new Date(results.issuedDate);
        longTerm = !!results.longTerm;
        return results;
      }, function (err) { // clear on error
        lastError = err;
        return err;
      })
      .finally(function () {
        checking = false;
        lastCheck = new Date();
      });

    return this.resetTimeout();
  }).bind(this);

  this.refresh = function (touch) {
    this.touchIf(touch, true);
    return loop().$promise;
  };

  this.extendAccess = function (longTerm, touch) {
    this.touchIf(touch, true);
    return $auth.extendAccess((typeof longTerm === 'boolean') ? longTerm : this.longTerm)
      .then((function () { return this.refresh(touch); }).bind(this));
  };

  this.reset = function (touch) {
    checkPromise = null;
    expireAt  = null;
    issuedAt  = null;
    lastCheck = null;
    this.touchIf(touch);
    return this.resetTimeout();
  };

  this.touchIf = function (v, defaultVal, ts) {
    defaultVal = (typeof defaultVal === 'boolean')
      ? defaultVal
      : false;

    if((typeof v === 'boolean') ? v : defaultVal) {
      this.touch(ts);
    }

    return this;
  };

  this.touch = function (ts) {
    lastTouch = angular.isDate(ts) ? ts : new Date();
    return this;
  };

  this.resetTimeout = function () {
    if(timeout !== null) {
      $timeout.cancel(timeout);
      timeout = null;
    }

    if(!running) {
      return this;
    }

    timeout = $timeout(loop, interval);
    return this;
  };

  this.start = function () {
    if(running||!$auth.authenticated) return this.resetTimeout();
    running = true;
    loop();
    return this;
  };

  this.stop = function () {
    if(!running) return this.resetTimeout();
    running = false;
    this.reset();
    return this;
  };
})
.run(function ($rootScope, $interval, $heartBeat, $authWatch, $auth) {
  $heartBeat.touch();

  $authWatch((function (authenticated) { !!authenticated ? this.start() : this.stop(); }).bind($heartBeat));

  $rootScope.$on('$stateChangeStart',   $heartBeat.touch);
  $rootScope.$on('$stateChangeSuccess', $heartBeat.touch);
  $rootScope.$on('$stateChangeError',   $heartBeat.touch);

  var
  ACTION_NO_CHANGE = 'no-change',
  ACTION_RENEW     = 'renew',
  ACTION_LOGOUT    = 'logout';

  $rootScope.$watch(function () {
    if(!$heartBeat.running || !$heartBeat.isWarningGraced) {
      return ACTION_NO_CHANGE;
    }
    else if(!$heartBeat.isIdle && $heartBeat.isWarningGraced) {
      return ACTION_RENEW;
    }
    else if($heartBeat.ttlMs <= 0 && $heartBeat.running) {
      return ACTION_LOGOUT;
    }

    return ACTION_NO_CHANGE;
  }, function (action) {
    if(action === ACTION_NO_CHANGE)  return;
    if(action === ACTION_LOGOUT)     return $auth.logout();
    if(action === ACTION_RENEW)      return $heartBeat.extendAccess(null, false);
  });

  $interval(angular.noop, 1000); // only one needed globally, so the ttls update
});