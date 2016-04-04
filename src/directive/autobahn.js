angular.module('vx')
.directive( 'autobahn', function () {
  return {
    restrict: 'EA',
    controller: 'AutobahnCtrl as $autobahn'
  };
})
.controller('AutobahnCtrl', function ($scope, $wamp, $realTime) {
  this.wamp = $wamp;
  this.realTime = $realTime;

  Object.defineProperties(this, {
    starting: {
      get: function () { return $realTime.starting; }
    },
    stopping: {
      get: function () { return $realTime.stopping; }
    },
    lastPushDate: {
      get: function () { return $realTime.lastPushDate; }
    },
    connection: {
      get: function () { return $realTime.connection; }
    },
    connectionInfo: {
      get: function () { return $realTime.connectionInfo; }
    },
    log: {
      get: function () { return $realTime.log; }
    },
    session: {
      get: function () { return $realTime.session; }
    },
    connected: {
      get: function () { return $realTime.connected; }
    },
    stateClasses: {
      get: function () {
        return {
          'text-success': this.connected,
          'text-danger': !this.connected
        };
      }
    }
  });
});
