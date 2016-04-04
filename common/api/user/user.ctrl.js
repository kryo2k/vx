'use strict';

var
_ = require('lodash'),
validator = require('validator'),
AuthenticationError = require('../../components/error-authentication'),
InputError          = require('../../components/error-input'),
ValidationError     = require('../../components/error-validation'),
model = require('./user.model');

var
useLongTermToken = true;

function issueTokenPayload(token, user) {
  var
  tokenInfo = user.tokenParse(token),
  ttl       = user.tokenTTL(token);

  return {
    token:      token,
    ttl:        ttl,
    expireDate: (!!ttl && isFinite(ttl)) ? new Date(Date.now() + ttl) : null,
    longTerm:   (!!tokenInfo ? tokenInfo.longTerm : false)
  };
}

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
      res.pushTopicUser('vx.user.update', ['profile', req.user.profile]);
    });
  });
};

// @auth
// @method POST
exports.changePassword = function (req, res, next) {

  var
  existingPw = req.user.password,
  data = req.body,
  errorMsg = 'Problems encountered while changing your password.',
  errors = [];

  if(data.oldPassword !== existingPw) {
    errorMsg = 'Invalid original password. Password change unsuccessful.';
    errors.push({ path: 'oldPassword', value: data.oldPassword, message: 'Password supplied does not match current password.' });
  }
  if(!data.password) {
    errors.push({ path: 'password', value: data.password, message: 'New password was not provided.' });
  }
  if(!data.passwordConfirm) {
    errors.push({ path: 'passwordConfirm', value: data.passwordConfirm, message: 'New password confirmation was not provided.' });
  }

  if(data.oldPassword === data.password) {
    errorMsg = 'New password is the same as original password.';
    errors.push({ path: 'password', value: data.password, message: 'Please use a different password.' });
  }

  if(errors.length > 0) {
    return next(new ValidationError({ message: errorMsg, errors: errors }));
  }

  req.user.password        = data.password;
  req.user.passwordConfirm = data.passwordConfirm;

  req.user.save(function (err) {
    if(err) {
      return next(new ValidationError(err));
    }

    res.userNotify('change-password', {}, function (err) {
      if(err) return next(err);
      res.respondOk();
      res.pushTopicUser('vx.user.logout'); // logout all user sessions
    });
  });
};

// @auth
// @method GET
exports.tokenInfo = function (req, res, next) {
  res.respondOk({
    ttl: req.tokenTTL,
    longTerm: req.tokenLongTerm,
    expireDate: req.tokenExpireDate,
    issuedDate: req.tokenIssuedDate
  });
};

// @auth
// @method GET
exports.tokenExtend = function (req, res, next) {
  res.respondOk(issueTokenPayload(model.createToken(req.user, parseInt(req.query.longTerm) === 1), req.user));
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
      return model.findUserByToken(token)
        .then(function (user) {
          res.respondOk(issueTokenPayload(token, user));
          return token;
        });
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

    user.addNotification('signup', { name: user.name, email: user.email, date: user.created }, function (err) {
      if(err) return next(err);

      res.respondOk(issueTokenPayload(model.createToken(user, false), user));
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
