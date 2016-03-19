'use strict';

var
util = require('util');

function AuthenticationError (err, meta) {
  this.name = 'AuthenticationError';
  this.message = 'An unknown authentication error occurred.';
  this.meta = {};

  if(err) {
    this.message = err;
  }

  if(meta) {
    this.meta = meta;
  }
}

util.inherits(AuthenticationError, Error);

module.exports = AuthenticationError;