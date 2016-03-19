angular.module('coordinate-vx')
.directive( 'formReset', function () {
  return {
    require: ['form'],
    scope: {
      reset: '&formReset'
    },
    link: function (scope, el, attr, ctrls) {
      function notify (event, form) {
        return function () {
          scope.reset({ $event: event, $form: form });

          if(!event.defaultPrevented) {
            form.$setPristine();
          }
        };
      }

      el.bind('reset', function (event) { scope.$apply(notify(event, ctrls[0])); });
    }
  };
});