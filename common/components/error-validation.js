'use strict';

var
util = require('util');

function ValidationError (mongoError) {
  this.name = 'ValidationError';
  this.message = 'An unknown validation error occurred.';

  if(mongoError) {
    this.message = 'A validation error occurred. See details.';
    this.errors = mongoError.errors;
  }
}

util.inherits(ValidationError, Error);

module.exports = ValidationError;