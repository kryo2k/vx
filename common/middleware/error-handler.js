'use strict';

var
util = require('util'),
log = require('../components/log'),
ValidationError = require('../components/error-validation');

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
    else if(util.isError(err)) {
      log.error('%s', err.stack);
      payload.message = err.message;
    }

    if(res.headersSent) {
      log.warn(util.format('Unable to send data for error (%j), headers have already been sent.', payload.message))
      return next();
    }
    else {
      res.status(500).send(payload);
    }
  };
};