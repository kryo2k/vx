angular.module('vx')
.service('$modalOpen', function ($rootScope, $uibModal) {

  /**
   * Opens a modal
   * @param  {Object} scope      - an object to be merged with modal's rootScope child
   * @param  {String} opts       - any valid opts for uibModal
   * @return {Object}            - the instance $uibModal.open() returns
   */
  return function (scope, opts) {
    return $uibModal.open(angular.extend({
      templateUrl: 'modal/default.html',
      scope: angular.extend($rootScope.$new(), scope || {})
    }, opts));
  };
});
