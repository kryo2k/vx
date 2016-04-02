angular.module('vx')
.directive( 'heartBeatTouchzone', function ($window, $debounce, $heartBeat) {
  return {
    require: '?heartBeat',
    restrict: 'AC',
    link: function (scope, el, attr, ctrl) {
      var
      sensitivity = 0.7, debounceMs = 50,
      lastX = null, lastY = null,
      touch = function () {
        if(ctrl) { // touch thru optional controller
          return ctrl.touch();
        }

        return $heartBeat.touch();
      },
      clickDetect = function () { touchDeb(); },
      moveDetect = function (event) {
        var
        curX = event.clientX,
        curY = event.clientY;

        if(lastX === null) lastX = curX;
        if(lastY === null) lastY = curY;

        var
        el0 = el[0],
        dX = Math.pow(lastX - curX, 2),
        dY = Math.pow(lastY - curY, 2),
        strength = Math.sqrt(dX + dY) / Math.min(el0.offsetWidth, el0.offsetHeight),
        strengthTest = (strength >= (1 - sensitivity));

        // update position
        lastX = curX;
        lastY = curY;

        if(strengthTest) {
          touchDeb();
        }
      },
      touchDeb = $debounce(touch, debounceMs, true),
      moveDetDeb = $debounce(moveDetect, debounceMs, true);

      attr.$observe('zoneSensitivity', function (val) {
        var pct = parseFloat(val, 10);
        if(!angular.isNumber(pct) || isNaN(pct) || !isFinite(val)) return;
        sensitivity = pct;
      });

      attr.$observe('debounceDelay', function (val) {
        var num = parseInt(val, 10);
        if(!angular.isNumber(num) || isNaN(num) || !isFinite(val)) return;
        debounceMs = num;
        touchDeb = $debounce(touch, num, true);
        moveDetDeb = $debounce(moveDetect, num, true);
      });

      // listen for these events as input:
      angular.element(el).bind('mousemove', moveDetDeb);
      angular.element(el).bind('touchmove', moveDetDeb);
      angular.element(el).bind('click',      clickDetect);
      angular.element(el).bind('touchstart', clickDetect);
    }
  };
});
