angular.module('coordinate-vx')
.directive( 'infiniteScroll', function ($debounce) {
  return {
    scope: {
      getMore: '&infiniteScroll'
    },
    link: function(scope, element, attrs) {
      var threshold = 100;

      element[0].addEventListener('scroll', $debounce(function() {
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
