angular.module('coordinate-vx')
.directive('userNotifications', function () {
  return {
    restrict: 'A',
    transclude: true,
    replace: true,
    templateUrl: 'directive/user-notifications.html',
    controller: 'UserNotificationsCtrl as $notifications'
  };
})
.controller('UserNotificationsCtrl', function ($q, $scope, $realTime, $filter) {
  var filterEllipsis = $filter('ellipsis');

  function subscriptionUpdate(args, meta) {
  //  console.log('PUSH response from input test:', args, meta);
  }

  function subChange(promise) {
    $scope.subscriptionChanging = true;
    return promise
      .finally(function () {
        $scope.subscriptionChanging = false;
      });
  }

  var
  activeSubscription = false;

  this.subscribe = function () {
    if(activeSubscription) {
      return $q.when(activeSubscription);
    }

    return subChange($realTime.subscribeScope($scope, 'vx.user.notifications', subscriptionUpdate))
      .then(function(subscription) {
        activeSubscription = subscription;
        $scope.pushSubscribe = true;
        return activeSubscription;
      });
  };

  this.unsubscribe = function () {
    if(!activeSubscription || !activeSubscription.active) {
      if(activeSubscription) activeSubscription = false; // clean up?
      return $q.when(true);
    }

    return subChange($realTime.unsubscribe(activeSubscription))
      .then(function (res) {
        activeSubscription = false;
        $scope.pushSubscribe = false;
        return true;
      });
  };

  $scope.pushSubscribe = activeSubscription;

  $scope.$watch('pushSubscribe', (function (nv, ov) {
    if(nv === ov||$scope.subscriptionChanging) return;
    nv ? this.subscribe() : this.unsubscribe();
  }).bind(this));

  this.subscribe();
});
