angular.module('coordinate-vx')
.directive('pageTitle', function ($state) {
  return {
    controller: 'PageTitleCtrl',
    link: function (scope, el, attr, ctrl) {

      ctrl.setTitle(el.html());

      scope.$on('$destroy', scope.$watch(function () {
        if(!$state.current || !$state.current.data || !$state.current.data.title) {
          return false;
        }

        return $state.current.data.title;
      }, function (title) {
        if(!title) return;
        ctrl.append(title);
        el.html(ctrl.title);
      }));

      scope.$on('$destroy', scope.$on('$stateChangeStart', function () {
        ctrl.undo(); // step back one
      }));
    }
  };
})