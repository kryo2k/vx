angular.module('coordinate-vx')
.directive( 'infiniteScroll', function ($debounce) {
  return {
    scope: {
      getMore: '&infiniteScroll'
    },
    require: '?^uibDropdown',
    link: function(scope, element, attrs, ctrl) {
      var threshold = 100;

      element[0].addEventListener('scroll', $debounce(function() {
        if(ctrl && !ctrl.isOpen()) { // ignore reloading if dd's are closed.
          return;
        }

        var
        elementHeight       = element.prop('offsetHeight'),
        scrollableHeight    = element.prop('scrollHeight'),
        scrollTop           = element.prop('scrollTop'),
        distToBottom        = (scrollableHeight - elementHeight) - scrollTop;

        if (distToBottom <= threshold) {
          scope.getMore({});
        }
      }, 150));
    }
  };
});
