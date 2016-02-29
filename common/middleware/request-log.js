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

      req._startedAt = new Date();

      var
      logString = format('(%s) %s %s', req.id, req.method, req.originalUrl);

      switch(req.method) {
        case 'GET':
        break;
        case 'POST':
        logString += format(' %j', req.body);
        break;
        case 'PUT':
        logString += format(' %j', req.body);
        break;
        case 'DELETE':
        break;
      }

      var
      pend  = res.end.bind(res);
      res.end = function (data) { // overload end function

        var
        dur = Date.now() - req._startedAt.getTime(),
        len = parseInt(res.getHeader('Content-Length'), 10),
        status = res.statusCode;

        len = isNaN(len)
          ? (!!data ? data.length : 0)
          : len;

        log.info(logString + format(' => %s [%s] [%d ms]', status, bytes(len), dur));

        return pend.apply(this, arguments);
      };

      next();
    });
};