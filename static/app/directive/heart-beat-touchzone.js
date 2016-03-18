angular.module('coordinate-vx')
.directive( 'heartBeatTouchzone', function ($debounce, $heartBeat) {
  return {
    require: '?heartBeat',
    restrict: 'AC',
    link: function (scope, el, attr, ctrl) {
      var detect = $debounce(function (event) {

        if(ctrl) { // touch thru optional controller
          return ctrl.touch();
        }

        return $heartBeat.touch();
      }, 50, true);

      angular.element(el).bind('mousemove', detect);
    }
  };
});