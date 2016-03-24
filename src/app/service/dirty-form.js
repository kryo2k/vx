angular.module('coordinate-vx')
.service('$dirtyForm', function (){
  return function (form) {
    if(!form || !form.hasOwnProperty('$setDirty'))
      return form;

    form.$setDirty(true); // set form to be dirty

    angular.forEach(form, function (model, key) { // set all child models to be dirty
      if (angular.isObject(model) && model.hasOwnProperty('$modelValue')) {
        model.$setDirty();
      }
    });

    return form;
  };
})
