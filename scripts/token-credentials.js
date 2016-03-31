#!/bin/env node

'use strict';

var
Q = require('q'),
format = require('util').format,
mongoose = require('mongoose'),
mongoUtil = require('../common/components/mongo-util'),
config = require('../config'),
ModelUser = require('../common/api/user/user.model');

var token = process.argv[2];

var // connect to mongo server
db = mongoose.connect(config.database.uri, config.database.options);

Q.nfcall(ModelUser.findUserByToken.bind(ModelUser), token)
.then(function (doc) {
  if (!doc) {
    return Q.reject(new Error(format('User was not found by token (%s).', token)));
  }

  console.log('User (%s) password is: %j', doc.email, doc.password);
  return true;
})
.catch(function (err) {
  console.error(err.stack||err);
  return err;
})
.finally(function () {
  db.disconnect();
});
