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
.controller('AppGuestLoginCtrl', function ($scope, $auth, $guestOnly) {

  $guestOnly($scope);

  this.submit = function (event, form) {
    return $auth.login(this.model.username, this.model.password, this.model.rememberMe)
      .catch((function (err) {
        if(this.model) {
          delete this.model.password; // clear password field
        }
        return err;
      }).bind(this));
  };
  this.reset = function (event, form) {
    delete this.model;
  };
});
