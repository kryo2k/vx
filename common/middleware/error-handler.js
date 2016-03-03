'use strict';

var
util = require('util'),
log = require('../components/log'),
ValidationError = require('../components/error-validation'),
AuthenticationError = require('../components/error-authentication');

module.exports = function (config) {
  return function (err, req, res, next) { // cant be a composable, signature doesn't match.

    var
    payload = {
      success: false,
      message: 'unknown system error'
    };

    if(err instanceof ValidationError) { // no need to log these
      payload.message = err.message;
      payload.errors  = err.errors;
    }
    else if(err instanceof AuthenticationError) { // high-light these guys
      var meta = err.meta;
      log.warn('auth error: %s', err.message, meta);
      payload.message = err.message;

      if(meta.statusCode) {
        res.status(meta.statusCode);
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