#!/bin/env node

'use strict';

var
Q = require('q'),
format = require('util').format,
mongoose = require('mongoose'),
mongoUtil = require('../common/components/mongo-util'),
config = require('../config'),
ModelUser = require('../common/api/user/user.model');

var
userID = process.argv[2],
newPasswd = process.argv[3];

if(!mongoUtil.isObjectId(userID)) {
  console.log('Invalid/missing user ID.');
  return;
}
else if(!newPasswd) {
  console.log('No new password was provided.');
  return;
}

var // connect to mongo server
db = mongoose.connect(config.database.uri, config.database.options);

Q.nfcall(ModelUser.findById.bind(ModelUser), userID)
.then(function (doc) {
  if (!doc) {
    return Q.reject(new Error(format('User (%s) was not found.', userID)));
  }

  console.log('Resetting user (%s) password..', doc.email);

  doc.password        = newPasswd;
  doc.passwordConfirm = newPasswd;

  return Q.nfcall(doc.save.bind(doc))
    .then(function () {
      console.log('Password set to: %j', newPasswd);
    });
})
.catch(function (err) {
  console.error(err.stack||err);

  if(err.errors) {
    console.error(err.errors);
  }
  return err;
})
.finally(function () {
  db.disconnect();
});