angular.module('coordinate-vx')
.controller('HeartBeatCtrl', function ($scope, $heartBeat, DURATION_SHORT) {
  this.service = $heartBeat;

  $scope.durationOpts = angular.extend({}, DURATION_SHORT, {
    inputAsSec:   true
  });

  Object.defineProperties(this, {
    isActive: {
      get: function () { return $heartBeat.running && $heartBeat.ttl > 0; }
    },
    isWarning: {
      get: function () { return $heartBeat.isWarning; }
    },
    isIdle: {
      get: function () { return $heartBeat.isIdle; }
    }
  });

  this.touch = $heartBeat.touch.bind($heartBeat);
  this.touchIf = $heartBeat.touchIf.bind($heartBeat);
  this.refresh = $heartBeat.refresh.bind($heartBeat);
  this.extend = $heartBeat.extendAccess.bind($heartBeat);
});