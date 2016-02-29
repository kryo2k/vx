'use strict';

var
compose = require('composable-middleware'),
format = require('util').format,
log = require('../components/log');

module.exports = function (role) {
  return compose()
    .use(function (req, res, next) {

      log.debug('invoking auth function (role: %j)', role);

      next();
    });
};