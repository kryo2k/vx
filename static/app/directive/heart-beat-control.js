angular.module('coordinate-vx')
.directive( 'heartBeatControl', function () {
  return {
    restrict: 'EA',
    controller: 'HeartBeatCtrl as $heartBeat',
    templateUrl: 'app/tpl/heart-beat-control.html'
  };
});