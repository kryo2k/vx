'use strict';

var
_ = require('lodash'),
util = require('util'),
log = require('../components/log'),
InputError = require('../components/error-input'),
ValidationError = require('../components/error-validation'),
AuthenticationError = require('../components/error-authentication');

function normalizeValidationError (err, errKey) {
  var
  normalized  = {},
  isErrArray  = _.isArray(err),
  isErrObject = _.isObject(err),
  isErrString = _.isString(err);

  if(!errKey) {
    if(isErrObject) { errKey = err.path; }
    else if(isErrArray || isErrString) {
      console.warn('Error (%j:%j) has no error key to send.', errKey, err);
      errKey = null;
    }
  }

  if(!errKey) {
    return false;
  }

  normalized.property = errKey;

  if(isErrArray || isErrString) {
    normalized.message = isErrString ? err : err.filter(_.isString);
  }
  else if(isErrObject) {
    normalized.original = err.value;
    normalized.message  = err.message;
  }

  return normalized;
}

function simplifyValidationErrors(errs) {
  var
  normalized = [];

  if(_.isArray(errs)) {
    normalized = errs.map(function (err) {
      return normalizeValidationError(err);
    });
  }
  else if(_.isObject(errs)) {
    normalized = Object.keys(errs).map(function (key) {
      return normalizeValidationError(errs[key], key);
    });
  }

  return normalized.reduce(function (p, c) {
    if(c && c.message) {
      p[c.property] = c;
    }

    return p;
  }, {});
}

module.exports = function (config) {
  return function (err, req, res, next) { // cant be a composable, signature doesn't match.

    var
    payload = {
      success: false,
      message: 'unknown system error'
    },
    defaultStatus = (res.statusCode === 200);

    if(err instanceof ValidationError) { // no need to log these
      payload.message = err.message;
      payload.errors  = simplifyValidationErrors(err.errors);

      if(defaultStatus) { // set to 400 if unchanged
        res.status(406);
      }
    }
    else if(err instanceof InputError) { // no need to log these
      payload.message = err.message;

      if(defaultStatus) { // set to 400 if unchanged
        res.status(400);
      }
    }
    else if(err instanceof AuthenticationError) { // high-light these guys
      var meta = err.meta;
      log.warn('auth error: %s', err.message, meta);
      payload.message = err.message;

      if(defaultStatus) {
        res.status(meta.statusCode||400);
      }
    }
    else if(util.isError(err)) {
      log.error('%s', err.stack);
      payload.message = err.message;
    }

    if(res.headersSent) {
      log.warn(util.format('Unable to send data for error (%j), headers have already been sent.', payload.message))
      return next();
    }
    else {
      if(res.statusCode === 200) { // set to 500 if unchanged
        res.status(500);
      }

      res.send(payload);
    }
  };
};
