'use strict';

var
compose = require('composable-middleware'),
InputError = require('../components/error-input');

module.exports = function () {
  return compose()
    .use(function (req, res, next) {

      res.userNotify = function (type, typeData, cb) {
        var user = req.user;

        if(!user) {
          return cb(new InputError('User to notify was not part of request.'));
        }

        return user.addNotification(type, typeData, cb);
      };

      next();
    });
};