angular.module('coordinate-vx')
.directive('ddOnCloseTop', function () {
  return {
    restrict: 'A',
    require: '^uibDropdown',
    link: function (scope, el, attr, dd) {
      scope.$watch(function () { return dd.isOpen(); }, function (open) {
        if(open) return;
        el[0].scrollTop = 0;
      });
    }
  };
});
