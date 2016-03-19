angular.module('coordinate-vx')
.controller('PageTitleCtrl', function ($scope, $state, RevControl) {
  var
  history = new RevControl([], 5),
  baseTitle = null,
  separator = ' - ';

  Object.defineProperties(this, {
    separator: {
      get: function () { return separator; },
      set: function (v) {
        if(!angular.isString(v)) return;
        separator = v;
      }
    },
    baseTitle: {
      get: function () { return baseTitle||''; },
      set: function (v) {
        if(!angular.isString(v)) return;
        baseTitle = v;
      }
    },
    title: {
      get: function () {
        var current = history.current;
        return angular.isString(current) ? current : '';
      }
    }
  });

  this.setTitle = function (title) {
    if(!angular.isString(title)) title = baseTitle;

    if(baseTitle === null) { // set the base title
      baseTitle = title;
    }

    if(angular.isString(title)) {
      history.apply(title);
    }

    // console.log(history.history);
    return this;
  };
  this.append = function (title) {
    return this.setTitle(this.baseTitle + separator + String(title));
  };
  this.prepend = function (title) {
    return this.setTitle(String(title) + separator + this.baseTitle);
  };
  this.undo = history.undo.bind(history);
  this.redo = history.redo.bind(history);
});