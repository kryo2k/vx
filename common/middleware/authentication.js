'use strict';

var
compose = require('composable-middleware'),
format = require('util').format,
log = require('../components/log'),
AuthenticationError = require('../components/error-authentication'),
ModelUser = require('../api/user/user.model');

module.exports = function (options) {
  options = options || {};

  var
  headerKey     = options.headerKey||'authorization',
  allowUrlParam = !!options.allowUrlParam,
  urlParam      = !!options.urlParam || 'auth_token';

  return compose()
    .use(function (req, res, next) {

      var
      authorization = req.headers[headerKey]||false;

      if(allowUrlParam && req.query && req.query.hasOwnProperty(urlParam)) {
        authorization = req.query[urlParam];
      }

      if(!authorization) { // nothing was found, automatic forbidden
        return next(new AuthenticationError('No authorization token was found.'));
      }

      ModelUser.findUserByToken(authorization, function (err, user) {
        if(err) {
          return next(err);
        }

        if(!user) { // invalid token
          return next(new AuthenticationError('Token provided is invalid or expired. Login to get a new token.', { statusCode: 401, token: authorization }));
        }

        req.user = user;
        req.tokenInfo = user.tokenParse(authorization);
        req.tokenTTL = user.tokenTTL(authorization);
        req.tokenExpireDate = (req.tokenTTL && isFinite(req.tokenTTL))
          ? new Date(Date.now() + req.tokenTTL)
          : null;
        req.tokenIssuedDate = (req.tokenInfo && typeof req.tokenInfo.iAt === 'number' )
          ? new Date(req.tokenInfo.iAt)
          : false;
        req.tokenLongTerm = req.tokenInfo ? req.tokenInfo.longTerm : false;

        next();
      });
    });
};