angular.module('coordinate-vx')
.directive('pageHeader', function () {
  return {
    replace: true,
    transclude: true,
    controller: 'PageHeaderCtrl',
    templateUrl: 'directive/page-header.html',
    scope: {
      title: '=phTitle',
      description: '=phDescription'
    }
  };
})
.controller('PageHeaderCtrl', function ($scope) {
});
