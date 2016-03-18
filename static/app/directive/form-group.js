angular.module('coordinate-vx')
.directive( 'formGroup', function () {
  return {
    restrict: 'C',
    require: '^form',
    link: function (scope, el, attr, form) {
      if(!form) return;

      var
      clsError   = 'has-error',
      clsSuccess = 'has-success',
      rEl = el[0],
      // get names of child inputs models (exclude inputs without names)
      names = Array.prototype.slice.call(rEl.querySelectorAll('[ng-model]')).reduce(function (p, e) {
        var name = angular.element(e).attr('name');
        if(name) p.push(name);
        return p;
      }, []);

      if(!names.length) { // nothing to watch
        return;
      }

      scope.$watch(function () {
        return names.every(function (name) {
          var formModel = form[name];
          if(!formModel) {
            return true;
          }

          return formModel.$valid;
        });
      }, function(valid) {
        if(valid) {
          el.removeClass(clsError);
          el.addClass(clsSuccess);
        }
        else {
          el.addClass(clsError);
          el.removeClass(clsSuccess);
        }
      });
    }
  };
});