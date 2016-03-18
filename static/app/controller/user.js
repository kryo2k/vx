angular.module('coordinate-vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.user', {
      abstract: true,
      templateUrl: 'app/tpl/user.html',
      controller: 'AppUserCtrl',
      resolve: {
        authorization: ['$auth', function ($auth) {
          return $auth.ready;
        }]
      }
    });
})
.controller('AppUserCtrl', function ($scope, $rootScope, $state, $stateParams, authorization, $authWatch) {

  var
  loginState = 'app.guest.login',
  loginParams = {},
  kickOut = function () {
    $rootScope.restoreState = {
      name: $state.current.name,
      params: angular.copy($stateParams)
    };
    return $state.go(loginState, loginParams);
  };

  if(!authorization) { // take the user to the login page, but remember where he was for re-login.
    return kickOut();
  }

  $scope.$on('$destroy', $authWatch(function (authenticated) {
    if(!authenticated) {
      kickOut();
    }
  }));
});