'use strict';

var
compose = require('composable-middleware'),
bytes = require('bytes'),
format = require('util').format,
log = require('../components/log');

module.exports = function (config) {
  config = config || {};
  return compose()
    .use(function (req, res, next) {

      res.respondOk = function (data, code) {

        if(res.headersSent) {
          log.warn(format('Unable to send data for success (%j), headers have already been sent.', data));
          return;
        }

        if(!isNaN(code)) res.status(code);

        return res.send({
          success: true,
          data: data
        });
      };

      next();
    });
};