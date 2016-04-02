angular.module('vx')
.directive( 'autobahnControl', function () {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: 'directive/autobahn-control.html',
    controller: function ($scope, User) {
      $scope.notificationTest = function () {
        return User.notificationTest({ test: true }).$promise
          .then(function(response) {
            console.log('HTTP response from notification test:', response);
            return response;
          });
      };
    }
  };
});
