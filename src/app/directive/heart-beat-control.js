angular.module('coordinate-vx')
.directive( 'heartBeatControl', function () {
  return {
    restrict: 'EA',
    controller: 'HeartBeatCtrl as $heartBeat',
    templateUrl: 'directive/heart-beat-control.html'
  };
});
