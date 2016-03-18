angular.module('coordinate-vx')
.directive('pageHeader', function () {
  return {
    replace: true,
    transclude: true,
    controller: 'PageHeaderCtrl',
    templateUrl: 'app/tpl/page-header.html',
    scope: {
      title: '=phTitle',
      description: '=phDescription'
    }
  };
})