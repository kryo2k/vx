angular.module('coordinate-vx')
.directive( 'autobahnControl', function () {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: 'directive/autobahn-control.html',
    controller: function ($scope, User) {
      $scope.inputTest = function () {
        return User.input({ test: true }).$promise
          .then(function(response) {
            console.log('HTTP response from input test:', response);
            return response;
          });
      };
    }
  };
});
