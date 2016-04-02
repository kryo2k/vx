'use strict';

var
_ = require('lodash'),
format = require('util').format,
validator = require('validator'),
ValidationError = require('../../../components/error-validation'),
InputError = require('../../../components/error-input'),
recapchaValidator = require('../../../components/recaptcha-verifier'),
model = require('./reset-pw.model');

exports.submit = function (req, res, next) {
  var
  body = req.body,
  recaptcha = body.recaptcha;

  recapchaValidator.checkResponse(recaptcha, function (err, response) {

    if(err) {
      return next(err);
    }

    var
    name      = body.name,
    email     = body.email,
    errors    = [];

    if(!response.success) {
      errors.push({ path: 'recaptcha', value: recaptcha, message: 'Invalid recaptcha result was provided.' });
    }

    if(!_.isString(email) || !validator.isEmail(email)) {
      errors.push({ path: 'email', value: email, message: 'The supplied email is in invalid format.' });
    }

    if(errors.length > 0) {
      return next(new ValidationError({ validationMessage: 'Invalid forgot password submission, please check the errors in the form.', errors: errors }));
    }

    model.fromEmail(email, function (err) {
      if(err) {
        return next(err);
      }

      res.respondOk({ message: 'Your reset password request has been received. If this account exists, and you have access to the email, you will receive an email with a link to reset your password.' });
    });
  });
};

exports.validate = function (req, res, next) {
  model.findOne({ uniqueId: req.params.uniqueId }, '_id user')
    .populate('user', '_id name email')
    .exec(function (err, doc) {
      if(err) {
        return next(err);
      }

      res.respondOk(doc);
    });
};

exports.changePassword = function (req, res, next) {
  var
  body = req.body;

  model.findById(req.params.id, '_id user')
    .populate('user')
    .exec(function (err, doc) {
      if(err) {
        return next(err);
      }
      else if(!doc) {
        return next(new InputError(format('Unable to locate the password change request provided (%s).', req.params.id)));
      }

      doc.user.password        = body.password;
      doc.user.passwordConfirm = body.passwordConfirm;

      doc.user.save(function (err) {
        if(err) {
          return next(new ValidationError(err));
        }

        doc.remove(function () {
          res.respondOk({ message: 'Your password has been successfully changed. You can now log-in with your new password.' });
        });
      });
    });
};
