angular.module('coordinate-vx')
.directive( 'formInput', function ($parse) {
  var id = 'formInput';

  return {
    restrict: 'A',
    require: [id,'^form'],
    controller: 'FormInputCtrl as $formInput',
    link: function (scope, el, attr, ctrl) {
      var
      self = ctrl[0];
      self.form = ctrl[1];

      var parseModel = $parse(attr[id]);

      function bind() {
        var current = parseModel(scope);
        self.reset();

        if(angular.isString(current) && form.hasOwnProperty(current)) {
          self.model = form[current];
        }
        else if(angular.isObject(current) && current.hasOwnProperty('$name')) {
          self.model = current;
        }
      }

      attr.$observe(id, bind);
    }
  };
})
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
