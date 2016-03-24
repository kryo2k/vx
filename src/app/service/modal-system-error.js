angular.module('coordinate-vx')
.service('$modalSystemError', function ($q, $modalOpen) {
  return function (err) {
    var dialog = $modalOpen({
      modal: {
        title: err.title,
        text: err.message,
        titleClass: 'text-danger',
        bodyClass: 'text-danger',
        dismissable: true,
        buttons: [{
          text: 'Okay',
          click: function (event) {
            dialog.dismiss.apply(dialog, event);
          }
        }]
      }
    }, {
      windowClass: 'slide',
      size: 'modal-sm'
    });

    return dialog;
  };
})
.run(function ($modalSystemError, $rootScope) {
  $rootScope.$on('$systemError', function (event, error) {
    return $modalSystemError(error).result;
  });
});