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
      output = [
        format('(%s)', req.id),
        format('%s', req.method),
        format('%s', req.originalUrl),
      ];

      switch(req.method) {
        case 'GET':
        break;
        case 'DELETE':
        break;
        case 'PUT':
        case 'POST':
        output.push(format('%j', req.body));
        break;
      }

      var
      pend  = res.end.bind(res);
      res.end = function (data) { // overload end function

        if(req.user) {
          output.splice(1, 0, format('[%s]', req.user.name||req.user._id));
        }

        var
        dur = Date.now() - req._startedAt.getTime(),
        len = parseInt(res.getHeader('Content-Length'), 10),
        status = res.statusCode;

        len = isNaN(len)
          ? (!!data ? data.length : 0)
          : len;

        output.push(
          '=>',
          status,
          format('[%s]', bytes(len)),
          format('[%d ms]', dur)
        );

        log.info(output.join(' '));

        return pend.apply(this, arguments);
      };

      next();
    });
};