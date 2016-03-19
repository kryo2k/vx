angular.module('coordinate-vx')
.controller('FormResetCtrl', function ($scope) {

  Object.defineProperties(this, {
  });

  this.notify = function (form) {
    $scope.$broadcast('$formReset', form);
    return this;
  }

  this.addListener = function (fn) {
    return $scope.$on('$formReset', fn);
  };
});
