'use strict';

var
Recaptcha = require('recaptcha-verify'),
config = require('../../config').recaptcha;

module.exports = new Recaptcha({
  secret: config.secretKey,
  verbose: !!config.verbose
});
