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
})
.controller('HeartBeatTitleCtrl', function ($q, $scope, $timeout, $filter, RevControl, $heartBeat, DURATION_SHORT) {
  var
  durationFilter = $filter('duration'),
  baseTitle = null,
  separator = ' | ',
  animationPause = 1000;

  Object.defineProperties(this, {
    alertChar: {
      get: function () { return alertChar; },
      set: function (v) {
        if(!angular.isString(v)) return;
        alertChar = v;
      }
    },
    separator: {
      get: function () { return separator; },
      set: function (v) {
        if(!angular.isString(v)) return;
        separator = v;
      }
    },
    baseTitle: {
      get: function () { return baseTitle||''; },
      set: function (v) {
        if(!angular.isString(v)) return;
        baseTitle = v;
      }
    }
  });

  var
  alerting = false,
  stepIndex = 0,
  setTitle = (function (title) {
    if(!this.element) return title;
    this.element.html(title);
    return title;
  }).bind(this),
  currentDuration = function () {
    return durationFilter($heartBeat.ttlMs, DURATION_SHORT);
  },
  steps = [
    function (ltitle, next) { next( currentDuration() + this.separator + this.baseTitle); }
  ],
  loop = (function () {
    if(!alerting || !this.element) return;

    var
    me = this,
    promise = steps.reduce(function (promise, step) {
      return promise.then(function (lastTitle) {
        if(!alerting) return promise; // cancel alerting
        var defer = $q.defer();
        step.call(me, lastTitle, defer.resolve.bind(defer));
        return defer.promise.then(setTitle);
      });
    }, $q.when(me.baseTitle))
    .finally(function () {
      $timeout(loop, animationPause);
    });

    return promise;
  }).bind(this);

  this.startAlert = function () {
    alerting = true;
    loop();
  };
  this.stopAlert = function () {
    alerting = false;
    setTitle(this.baseTitle);
  };
});
