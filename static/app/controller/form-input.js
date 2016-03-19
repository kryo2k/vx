angular.module('coordinate-vx')
.controller('FormInputCtrl', function () {
  var
  form = null,
  model = null;

  Object.defineProperties(this, {
    model: {
      get: function () {
        return model;
      },
      set: function (v) {
        model = v||null;
      }
    },
    field: {
      get: function () {
        if(!this.hasModel) return false;
        return this.model.$name;
      }
    },
    form: {
      get: function () { return form; },
      set: function (v) {
        form = v||null;
      }
    },
    hasForm: {
      get: function () {
        return form !== null;
      }
    },
    hasModel: {
      get: function () {
        return model !== null;
      }
    }
  });

  this.reset = function () {
    form = null;
    model = null;
    return this;
  };
});
