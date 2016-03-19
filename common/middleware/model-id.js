'use strict';

var
Q = require('q'),
_ = require('lodash'),
compose = require('composable-middleware'),
format = require('util').format,
InputError = require('../components/error-input'),
mongoUtil = require('../components/mongo-util'),
log = require('../components/log');

//
// TODO: add better filtering capability middleware to this.
//

module.exports = function (opts) {
  opts = opts || {};

  var
  model     = opts.model,
  modelName = opts.modelName||'document',
  param     = opts.param||'id',
  select    = opts.select||null,
  property  = opts.property||'resolved';

  if(!model) {
    throw new Error('Model is required.');
  }

  if(_.isString(param)) {
    param = function (req) {
      return req.params[opts.param];
    };
  }
  else if (!_.isFunction(param)) {
    throw new Error('Param must be a string or a function.');
  }

  return compose()
    .use(function (req, res, next) { // resolve document id
      Q.when(param(req)).then(function (id) {
        req[property] = id;
        next();
      }).catch(next);
    })
    .use(function (req, res, next) {
      var id = req[property];

      if(!mongoUtil.isObjectId(id)) {
        return next(new InputError(format('Identifier (%s) for %s is an invalid format.', id, modelName)));
      }

      var modelFn = model.findById.bind(model);

      modelFn(id, select, opts.options, function (err, doc) {
        if(err) {
          return next(err);
        }

        if(!doc) {
          return next(new InputError(format('Could not find requested %s (%s).', modelName, id)));
        }

        req[property] = doc;
        next();
      });
    });
};