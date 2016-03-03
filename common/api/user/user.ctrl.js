'use strict';

var
AuthenticationError = require('../../components/error-authentication'),
ValidationError = require('../../components/error-validation'),
ModelUser = require('./user.model'),
config = require('../../../config');

var
useLongTermToken = false;

// @auth
// @method GET
exports.changePassword = function (req, res, next) {

  var
  existingPw = req.user.password,
  data = req.body;

  if(data.oldPassword !== existingPw) {
    return next(new AuthenticationError('Invalid original password. Password change unsuccessful.'));
  }

  req.user.password        = data.newPassword;
  req.user.passwordConfirm = data.newPasswordConfirm;

  req.user.save(function (err) {
    if(err) {
      return next(new ValidationError(err));
    }

    res.respondOk(req.user.profile);
  });
};

// @auth
// @method GET
exports.profile = function (req, res, next) {
  res.respondOk(req.user.profile);
};

// @method POST
exports.login = function (req, res, next) {

  var data = req.body;

  ModelUser.authenticate(data.username, data.password, useLongTermToken)
    .then(function (token) {
      res.respondOk({ token: token });
    })
    .catch(next);
};

// @method POST
exports.signup = function (req, res, next) {
  var
  user = new ModelUser(req.body);
  user.save(function (err) {
    if(err) {
      return next(new ValidationError(err));
    }

    res.respondOk({ token: user.tokenSign(ModelUser.sessionDuration(useLongTermToken)) });
  });
};