angular.module('coordinate-vx')
.directive( 'notification', function () { // ($parse, $compile
  var id = 'notification';
  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    templateUrl: 'directive/notification.html',
    scope: {
      model: '=notification',
      viewing: '&onNotificationView'
    }
  };
})
.directive ('notificationByType', function ($parse, $compile) {
  return {
    restrict: 'E',
    replace: true,
    link: function (scope, el, attr) {

      var
      getType = $parse(attr.type),
      render = function () {
        var type = getType(scope);
        if(!type) return;

        var
        tagName = 'notification-' + type,
        linkFn = $compile('<'+tagName+' options="'+attr.typeData+'"></'+tagName+'>');

        el.replaceWith(linkFn(scope));
      };

      scope.$watch(function () { return getType(scope); }, render);
    }
  };
});
