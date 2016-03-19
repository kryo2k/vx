angular.module('coordinate-vx')
.directive('navigation', function () {
  return {
    replace: true,
    transclude: true,
    controller: 'NavigationCtrl as $navigation',
    templateUrl: 'app/tpl/navigation.html'
  };
})