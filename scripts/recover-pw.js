#!/bin/env node

'use strict';

var
Q = require('q'),
format = require('util').format,
mongoose = require('mongoose'),
mongoUtil = require('../common/components/mongo-util'),
config = require('../config'),
ModelUser = require('../common/api/user/user.model');

var userID = process.argv[2];

if(!mongoUtil.isObjectId(userID)) {
  console.log('Invalid/missing user ID');
  return;
}

var // connect to mongo server
db = mongoose.connect(config.database.uri, config.database.options);

Q.nfcall(ModelUser.findById.bind(ModelUser), userID)
.then(function (doc) {
  if (!doc) {
    return Q.reject(new Error(format('User (%s) was not found.', userID)));
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