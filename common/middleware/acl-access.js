'use strict';

var
Q = require('q'),
_ = require('lodash'),
compose = require('composable-middleware'),
format = require('util').format,
log = require('../components/log'),
AuthenticationError = require('../components/error-authentication');

module.exports = function (options) {
  options = options || {};

  var
  oSubject = options.subject||false,
  oObject  = options.object||false,
  oRequire = options.require||[];

  if(_.isArray(oRequire)) {
    oRequire = oRequire.filter(_.isString);
  }
  else if(_.isString(oRequire)) {
    oRequire = [oRequire];
  }

  if(!oRequire || !oRequire.length) {
    oRequire = false;
  }

  var
  fSubject = _.isFunction(oSubject) ? oSubject : function (req) {
    if(_.isString(oSubject)) {
      return req[oSubject]||false;
    }
    return false;
  },
  fObject = _.isFunction(oObject) ? oObject : function (req) {
    if(_.isString(oObject)) {
      return req[oObject]||false;
    }
    return false;
  },
  fRequire = function (granted, requirements) {
    if(!requirements) { // allowed
      return true;
    }
    if(!granted || !_.isArray(granted)) {
      return requirements;
    }

    var failed = requirements.filter(function (r) {
      return granted.indexOf(r) === -1;
    });

    return failed.length > 0 ? failed : true;
  };

  return compose()
    .use(function (req, res, next) { // resolve acl subject/object
      Q.all([
        Q.when(fSubject(req)),
        Q.when(fObject(req))
      ])
      .spread(function (subject, object) {
        req.aclSubject = subject;
        req.aclObject  = object;
        next();
      })
      .catch(next);
    })
    .use(function (req, res, next) {

      var
      subject = req.aclSubject,
      object  = req.aclObject;

      if(!object) {
        return next(new AuthenticationError('ACL object was not found in request.'));
      }
      else if(!_.isFunction(object.getAccess)) {
        return next(new AuthenticationError('ACL object provided does not appear to be a valid ACL Object.'));
      }

      if(!subject) {
        return next(new AuthenticationError('ACL subject was not found in request.'));
      }
      else if(!_.isFunction(subject.getAccess) && !_.isString(subject)) {
        return next(new AuthenticationError('ACL subject has no check routine.'));
      }

      var subjectHas = false;

      if(_.isString(subject)) {
        subjectHas = object.getAccess(subject);
      }
      else {
        subjectHas = subject.getAccess(object);
      }

      var fRequireResult = fRequire(subjectHas, oRequire);

      if(_.isArray(fRequireResult)) {
        return next(new AuthenticationError(format('Request blocked, missing privilege (%s) on object.', fRequireResult.join('|'))));
      }

      next();
    });
};