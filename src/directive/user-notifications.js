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
.controller('UserNotificationsCtrl', function ($q, $scope, $realTime, $timeout, $filter, $debounce, PaginateLazy, UserNotification) {
  var filterEllipsis = $filter('ellipsis');

  var
  pushMarkReadQueue = [],
  notifications = this.source = new PaginateLazy(UserNotification.query.bind(UserNotification), {
    unreadOnly: 0,
    readOnly: 0
  });

  function setCounts(read, unread) {
    notifications.totalUnread = unread;
    notifications.totalRead   = read;
  }

  function reloadCounts() {
    return UserNotification.count().$promise
      .then(function(counts){
        setCounts(counts.read, counts.unread);
        return counts;
      });
  }

  function reloadNotifications() {
    return notifications.reload();
  }

  function subscriptionUpdate(args, meta) {
    var data = args[1];

    switch(args[0]) {
      case 'counts':
      setCounts(data.read, data.unread);
      break;
      case 'markRead':
      if(angular.isArray(data)) {
        notifications.records.forEach(function (rec) { // mark any records in view read
          if(data.indexOf(rec._id) > -1) {
            rec.unread = false;
          }
        });
      }
      break;
      case 'new':
      notifications.records.unshift(data);
      notifications.truncate();
      break;
    }
  }

  function subChange(promise) {
    $scope.subscriptionChanging = true;
    return promise
      .finally(function () {
        $scope.subscriptionChanging = false;
      });
  }

  var processMarkReadQueue = $debounce(function () {
    UserNotification.markRead(angular.copy(pushMarkReadQueue));
    pushMarkReadQueue.splice(0, pushMarkReadQueue.length);
  }, 500);

  notifications.$promise.then(reloadCounts);

  var
  activeSubscription = false;

  this.loadMore = notifications.loadMore.bind(notifications);
  this.reload = function () {
    return $q.all([
      reloadNotifications(),
      reloadCounts()
    ]);
  };

  this.markRead = function (notification) {
    var id = (!!notification ? notification._id : false);
    if(!id || !notification.unread || pushMarkReadQueue.indexOf(id) > -1) return;

    pushMarkReadQueue.push(id);
    processMarkReadQueue();
  };

  this.subscribe = function () {
    if(activeSubscription) {
      return $q.when(activeSubscription);
    }

    return subChange($realTime.subscribeScope($scope, 'vx.user.notifications', subscriptionUpdate.bind(this)))
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

  this.subscribe();

  $scope.onToggle = function (opened) {
    if(!opened) {
      notifications.truncate();
    }
  };
});
