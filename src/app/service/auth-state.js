angular.module('coordinate-vx')
.service('$authState', function ($rootScope, $state, $auth) {
  return {
    onStateChangeStart: function () {
      // console.log('state change start', arguments);
    },
    onStateChangeSuccess: function () {
      // console.log('state change success', arguments);
    },
    onStateChangeError: function (event, toState, toParams, fromState, fromParams, error) {
      // console.log('state change error', arguments);
    }
  };
})
.run(function ($rootScope, $authState) { // install service into rootscope events
  $rootScope.$on('$stateChangeStart',   $authState.onStateChangeStart);
  $rootScope.$on('$stateChangeSuccess', $authState.onStateChangeSuccess);
  $rootScope.$on('$stateChangeError',   $authState.onStateChangeError);
});