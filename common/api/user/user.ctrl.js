'use strict';

var
_ = require('lodash'),
AuthenticationError = require('../../components/error-authentication'),
InputError          = require('../../components/error-input'),
ValidationError     = require('../../components/error-validation'),
model = require('./user.model');

var
useLongTermToken = true;

// @auth
// @method POST
exports.updateProfile = function (req, res, next) {
  req.user.applyUpdate(req.body).save(function (err) {
    if(err) {
      return next(new ValidationError(err));
    }

    res.userNotify('update-profile', {}, function (err) {
      if(err) return next(err);
      res.respondOk();
    });
  });
};

// @auth
// @method POST
exports.changePassword = function (req, res, next) {

  var
  existingPw = req.user.password,
  data = req.body;

  if(data.oldPassword !== existingPw) {
    return next(new AuthenticationError('Invalid original password. Password change unsuccessful.', { attempted: data.oldPassword }));
  }
  if(!data.newPassword) {
    return next(new InputError('New password was not provided.'));
  }
  if(!data.newPasswordConfirm) {
    return next(new InputError('New password confirmation was not provided.'));
  }

  req.user.password        = data.newPassword;
  req.user.passwordConfirm = data.newPasswordConfirm;

  req.user.save(function (err) {
    if(err) {
      return next(new ValidationError(err));
    }

    res.userNotify('change-password', {}, function (err) {
      if(err) return next(err);
      res.respondOk();
    });
  });
};

// @auth
// @method GET
exports.tokenInfo = function (req, res, next) {
  res.respondOk({
    // info: req.tokenInfo,
    ttl: req.tokenTTL,
    longTerm: req.tokenLongTerm,
    expireDate: req.tokenExpireDate,
    issuedDate: req.tokenIssuedDate
  });
};

// @auth
// @method GET
exports.tokenExtend = function (req, res, next) {
  res.respondOk({ token: model.createToken(req.user, parseInt(req.query.longTerm) === 1) });
};

// @auth
// @method GET
exports.profile = function (req, res, next) {
  res.respondOk(req.user.profile);
};

// @method POST
exports.login = function (req, res, next) {

  var data = req.body;

  model.authenticate(data.username, data.password, data.rememberMe)
    .then(function (token) {
      res.respondOk({ token: token });
    })
    .catch(next);
};

// @method POST
exports.signup = function (req, res, next) {
  var
  user = new model(req.body);
  user.save(function (err) {
    if(err) {
      return next(new ValidationError(err));
    }

    user.addNotification('signup', {}, function (err) {
      if(err) return next(err);

      res.respondOk({ token: model.createToken(user, false) });
    });
  });
};

exports.testNotification = function (req, res, next) {
  res.userNotify('test', _.merge({ nonce: Date.now() }, req.body))
    .then(function (notification) {
      res.respondOk({ notification: notification });
    })
    .catch(next);
};
