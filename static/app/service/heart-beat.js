angular.module('coordinate-vx')
.service('$heartBeat', function ($timeout, User) {

  var
  running = false,
  interval = 10000,
  timeout = null;

  Object.defineProperties(this, {
    running: {
      get: function () {
        return running;
      }
    },
    interval: {
      get: function () {
        return interval;
      },
      set: function (v) {
        if(!angular.isNumber(v) || isNaN(v) || !isFinite(v) || v < 0) {
          return;
        }

        interval = v;
        this.resetTimeout();
      }
    }
  });

  var
  loop = (function () {
    if(!running) return this;
    console.log('$heartBeat', Date.now());

    User.tokenInfo().$promise
      .then(function (info) {
      // console.log('GOT result', info);
      })
      .catch(function (err) {
      // console.log('GOT err', err);
      });

    return this.resetTimeout();
  }).bind(this);

  this.start = function () {
    if(running) return this;
    running = true;
    this.resetTimeout();
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

  this.stop = function () {
    if(!running) return this;
    running = false;
    this.resetTimeout();
  };

})
.run(function ($heartBeat, $authWatch) {
  $authWatch((function (authenticated) { !!authenticated ? this.start() : this.stop(); }).bind($heartBeat));
});