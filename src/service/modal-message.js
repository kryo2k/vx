angular.module('vx')
.service('$modalMessage', function ($q, $modalOpen) {
  return function (message, title, cls) {
    title = title || 'Message';
    cls = cls || 'text-info';

    var dialog = $modalOpen({
      modal: {
        title: title,
        text: message,
        titleClass: cls,
        bodyClass: cls,
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
