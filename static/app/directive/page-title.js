angular.module('coordinate-vx')
.directive('pageTitle', function ($state) {
  return {
    link: function (scope, el, attr) {
      var originalTitle = el.html();

      scope.$on('$destroy', scope.$watch(function () {
        if(!$state.current || !$state.current.data || !$state.current.data.title) {
          return attr.defaultTitle||'';
        }

        return $state.current.data.title;
      }, function (title) {
        el.html(!!originalTitle ? (originalTitle + ' - ' + title) : title);
      }));
    }
  };
})