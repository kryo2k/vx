angular.module('coordinate-vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app', {
      abstract: true ,
      templateUrl: 'state/app.html',
      controller: 'AppCtrl as $app',
      data: {
      }
    });
})
.controller('AppCtrl', function ($scope, $state, $auth) {
  Object.defineProperties(this, {
    'state': {
      get: function () {
        return $state.current;
      }
    },
    'authenticated': {
      get: function () {
        return $auth.authenticated;
      }
    },
    'profile': {
      get: function () {
        return $auth.profile;
      }
    }
  });
});
