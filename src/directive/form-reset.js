angular.module('coordinate-vx')
.directive( 'formReset', function () {
  return {
    require: ['formReset','form'],
    scope: {
      reset: '&formReset'
    },
    controller: 'FormResetCtrl',
    link: function (scope, el, attr, ctrls) {
      var self = ctrls[0], form = ctrls[1];

      function notify (event, f) {
        return function () {

          self.notify(f);

          scope.reset({ $event: event, $form: f });

          if(!event.defaultPrevented) {
            form.$setPristine();
          }
        };
      }

      el.bind('reset', function (event) { scope.$apply(notify(event, form)); });
    }
  };
})
.controller('FormResetCtrl', function ($scope) {

  Object.defineProperties(this, {
  });

  this.notify = function (form) {
    $scope.$broadcast('$formReset', form);
    return this;
  }

  this.addListener = function (fn) {
    return $scope.$on('$formReset', fn);
  };
});
