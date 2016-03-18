angular.module('coordinate-vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.guest', {
      abstract: true,
      templateUrl: 'app/tpl/guest.html',
      controller: 'AppGuestCtrl'
    });
})
.controller('AppGuestCtrl', function ($scope) {
});