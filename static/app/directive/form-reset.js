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
          scope.reset({ $event: event, $form: f });

          self.notify(f);

          if(!event.defaultPrevented) {
            form.$setPristine();
          }
        };
      }

      el.bind('reset', function (event) { scope.$apply(notify(event, form)); });
    }
  };
});
