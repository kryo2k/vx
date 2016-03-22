angular.module('coordinate-vx')
.controller('UserNotificationsCtrl', function ($q, $scope, $rootScope, $auth, $authPersist, $realTime, $interval, $filter) {
  var filterEllipsis = $filter('ellipsis');

  //
  // todo make this into a re-useable class:
  //

  function subscriptionUpdate() {
    console.log('subscriptionUpdate:', arguments);
  }

  function subChange(promise) {
    $scope.subscriptionChanging = true;
    return promise
      .then(function (res) {
        console.log('GOT BACK:', res);
        return res;
      }, function (err) {
        console.log('GOT ERR:', err);
        return err;
      })
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

    // .'+$auth.profile._id+'

    return subChange($realTime.subscribeScope($scope, 'vx.user.notifications', subscriptionUpdate))
      .then(function(subscription) {
        console.log('Got subscription:', filterEllipsis(subscription.id), 'on topic:', subscription.topic);
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

  /////////////////

  $scope.pushSubscribe = activeSubscription;

  $scope.$watch('pushSubscribe', (function (nv, ov) {
    if(nv === ov||$scope.subscriptionChanging) return;
    nv ? this.subscribe() : this.unsubscribe();
  }).bind(this));

  this.subscribe();

  // $realTime.call('vx.user.requestChannel', [$authPersist.token])
  //   .then(function (result) {
  //     console.log('got result:', arguments);
  //   }, function (err) {
  //     console.log('got error:', arguments);
  //   });

});
