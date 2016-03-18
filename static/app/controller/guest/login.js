angular.module('coordinate-vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.guest.login', {
      url: '/login',
      templateUrl: 'app/tpl/guest/login.html',
      controller: 'AppGuestLoginCtrl as $login',
      data: {
        title: 'Login',
        description: 'Enter your login credentials'
      }
    });
})
.controller('AppGuestLoginCtrl', function ($rootScope, $scope, $auth, $state) {

  $scope.$watch(function () { return $auth.authenticated }, function (authenticated) {
    if(authenticated) {
      if($rootScope.restoreState) {
        var restore = $rootScope.restoreState;
        return $state.go(restore.name, restore.params);
      }

      return $state.go('app.user.dashboard');
    }
  });

  this.submit = function (event, form) {
    return $auth.login(this.model.username, this.model.password)
      .then(function (result) {
        console.log('login result:', result);
      })
      .catch((function (err) {
        if(this.model) {
          delete this.model.password; // clear password field
        }
      }).bind(this));
  };
  this.reset = function (event, form) {
    delete this.model;
  };
});