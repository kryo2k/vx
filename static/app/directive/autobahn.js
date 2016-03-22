angular.module('coordinate-vx')
.directive( 'autobahn', function () {
  return {
    restrict: 'EA',
    controller: 'AutobahnCtrl as $autobahn'
  };
});
