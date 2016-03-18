angular.module('coordinate-vx')
.directive( 'heartBeat', function () {
  return {
    restrict: 'EA',
    controller: 'HeartBeatCtrl as $heartBeat'
  };
});