'use strict';

var
ValidationError = require('../../../../common/components/error-validation'),
ModelHello = require('./hello.model');

exports.index = function (req, res, next) {
  ModelHello.find({})
    .sort({ created: -1})
    .exec(function (err, docs) {
      if(err) return next(err);
      res.respondOk(docs);
    });
};

exports.post = function (req, res, next) {
  ModelHello.create(req.body, function (err, doc) {
    if(err) return next(new ValidationError(err));
    res.respondOk(doc);
  });
};