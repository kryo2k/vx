angular.module('vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.user.messages', {
      url: '/messages',
      templateUrl: 'state/user/messages.html',
      controller: 'AppUserMessagesCtrl as $msgCtrl',
      data: {
        title: 'Messages',
        description: 'Internal mail and messaging system.'
      }
    });
})
.controller('AppUserMessagesCtrl', function ($scope) {
});
