'use strict';

var
winston = require('winston'),
config = require('../../config');

var // configure winston:
log = new (winston.Logger)(config.log);

function logger () {
  if(this.debug && !config.debugging) {
    return;
  }

  var
  args = Array.prototype.slice.call(arguments);
  args.unshift(this.type);

  log.log.apply(log, args);
}

module.exports = {
  silly: logger.bind({ type: 'silly', debug: true }),
  debug: logger.bind({ type: 'debug', debug: true }),
  error: logger.bind({ type: 'error' }),
  warn:  logger.bind({ type: 'warn' }),
  info:  logger.bind({ type: 'info' })
};