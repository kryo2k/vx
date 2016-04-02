angular.module('vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.guest.forgot-followup', {
      url: '/forgot/:uniqueId',
      templateUrl: 'state/guest/forgot-followup.html',
      controller: 'AppGuestForgotFollowUpCtrl as $forgotFollowUp',
      resolve: {
        validatedId: ['$stateParams','UserRecovery', function ($stateParams, UserRecovery) {
          return UserRecovery.validateId({ id: $stateParams.uniqueId }).$promise;
        }]
      }
    });
})
.controller('AppGuestForgotFollowUpCtrl', function ($scope, $state, $modalMessage, ErrorValidation, UserRecovery, validatedId) {

  Object.defineProperties(this, {
    valid: {
      get: function () {
        return validatedId.hasOwnProperty('_id');
      }
    },
    id: {
      get: function () {
        return validatedId._id || false;
      }
    },
    user: {
      get: function () {
        if(!this.valid || !validatedId.hasOwnProperty('user')) {
          return false;
        }

        return validatedId.user;
      }
    }
  });

  this.validatedId = validatedId;

  this.submit = function (event, form) {
    form.$setSubmitted();

    return UserRecovery.changePassword({ id: this.id }, this.model).$promise
      .then((function (result) {
        this.reset(null, form);
        form.$setPristine(true);
        $modalMessage(result.message);
        $state.go('app.guest.login');
        return result;
      }).bind(this))
      .catch((function (err) {
        if(ErrorValidation.is(err)) {
          err.gradeForm($scope, form);
        }
        return err;
      }).bind(this));
  };

  this.reset = function (event, form) {
    delete this.model;
  };
});
