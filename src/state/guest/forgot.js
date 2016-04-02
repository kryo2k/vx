angular.module('vx')
.config(function ($stateProvider) {
  $stateProvider
    .state('app.guest.forgot', {
      url: '/forgot',
      templateUrl: 'state/guest/forgot.html',
      controller: 'AppGuestForgotCtrl as $forgot',
      data: {
        title: 'Forgot Password',
        description: 'Recover your account access.'
      }
    })
    .state('app.guest.forgot-follow-up', {
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
.controller('AppGuestForgotCtrl', function ($scope, $modalMessage, $dirtyForm, $randomEmail, ErrorValidation, UserRecovery) {

  this.quickFill = function (form) {
    var
    m = this.model,
    ident = $randomEmail();

    if(!m) {
      m = this.model = {};
    }

    m.email = ident.toEmail();
    m.$wasPrefilled = true; // mark so view can respond

    $dirtyForm(form);
  };

  this.submit = function (event, form) {
    form.$setSubmitted();

    return UserRecovery.forgotPassword(this.model).$promise
      .then((function (result) {
        this.reset(null, form);
        form.$setPristine(true);
        $modalMessage(result.message);
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
})
.controller('AppGuestForgotFollowUpCtrl', function ($scope, $modalMessage, ErrorValidation, UserRecovery, validatedId) {

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
