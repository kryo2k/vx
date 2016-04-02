angular.module('vx')
.service('$guestOnly', function ($rootScope, $auth, $state) {
  return function (scope) {
    return (scope||$rootScope).$watch(function () { return $auth.authenticated }, function (authenticated) {
      if(authenticated) {
        if($rootScope.restoreState) {
          var restore = $rootScope.restoreState;
          delete $rootScope.restoreState;
          return $state.go(restore.name, restore.params);
        }

        return $state.go('app.user.dashboard');
      }
    });
  };
});
