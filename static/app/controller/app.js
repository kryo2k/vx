angular.module('coordinate-vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app', {
      abstract: true ,
      templateUrl: 'app/tpl/app.html',
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
    }
  });
});