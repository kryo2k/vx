'use strict';

var
util = require('util'),
log = require('../components/log'),
InputError = require('../components/error-input'),
ValidationError = require('../components/error-validation'),
AuthenticationError = require('../components/error-authentication');

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
      payload.errors  = err.errors;

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