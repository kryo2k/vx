angular.module('coordinate-vx')
.directive('pageHeader', function () {
  return {
    replace: true,
    transclude: true,
    templateUrl: 'directive/page-header.html',
    scope: {
      title: '=phTitle',
      description: '=phDescription'
    }
  };
});
