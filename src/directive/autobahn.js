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
    lastPushDate: {
      get: function () { return $realTime.lastPushDate; }
    },
    connection: {
      get: function () {
        return $wamp.connection;
      }
    },
    connectionInfo: {
      get: function () {
        var sess = this.session;

        if(!sess || !sess._socket || !sess._socket.info) {
          return false;
        }

        return sess._socket.info;
      }
    },
    log: {
      get: function () {
        return $realTime.log;
      }
    },
    session: {
      get: function () {
        var connection = this.connection;

        if(!connection || !connection.session) {
          return false;
        }

        return connection.session;
      }
    },
    connected: {
      get: function () {
        return !!this.session;
      }
    }
  });
});
