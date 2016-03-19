'use strict';

var
util = require('util');

function InputError (err, meta) {
  this.name = 'InputError';
  this.message = 'An unknown input error occurred.';
  this.meta = {};

  if(err) {
    this.message = err;
  }

  if(meta) {
    this.meta = meta;
  }
}

util.inherits(InputError, Error);

module.exports = InputError;