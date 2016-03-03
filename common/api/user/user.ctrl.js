'use strict';

var
ValidationError = require('../../components/error-validation'),
ModelUser = require('./user.model'),
config = require('../../../config');

var
useLongTermToken = false;

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