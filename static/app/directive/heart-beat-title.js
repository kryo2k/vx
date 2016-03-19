angular.module('coordinate-vx')
.directive( 'heartBeatTitle', function ($heartBeat) {
  return {
    require: ['heartBeatTitle', '?HeartBeatCtrl', '?pageTitle'],
    restrict: 'A',
    controller: 'HeartBeatTitleCtrl as $heartBeatTitleCtrl',
    link: function (scope, el, attr, ctrl) {
      var
      self      = ctrl[0],
      heartBeat = ctrl[1]||$heartBeat,
      pageTitle = ctrl[2];

      // link the reference to our controller
      self.element = angular.element(el);

      if(pageTitle) {
        scope.$watch(function () { return pageTitle.title; }, function (current) {
          self.baseTitle = current;
        });
      }

      scope.$watch(function () { return heartBeat.isWarning; }, function (isWarning) {
        isWarning ? self.startAlert() : self.stopAlert();
      });
    }
  };
});