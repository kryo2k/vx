angular.module('coordinate-vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.guest.index', {
      url: '/',
      templateUrl: 'app/tpl/guest/index.html',
      controller: 'AppGuestIndexCtrl',
      data: {
        title: 'Home',
        description: 'Click around the links above'
      }
    });
})
.controller('AppGuestIndexCtrl', function ($scope) {
});