angular.module('coordinate-vx')
.directive('pageTitle', function ($state) {
  return {
    controller: 'PageTitleCtrl',
    link: function (scope, el, attr, ctrl) {

      ctrl.setTitle(el.html());

      scope.$watch(function () {
        if(!$state.current || !$state.current.data || !$state.current.data.title || $state.current.data.hideTabTitle) {
          return false;
        }

        return $state.current.data.title;
      }, function (title) {
        if(title) {
          ctrl.prepend(title);
        }
        else {
          ctrl.undo();
        }

        el.html(ctrl.title);
      });

      scope.$on('$stateChangeStart', function () {
        ctrl.undo(); // step back one
      });
    }
  };
})