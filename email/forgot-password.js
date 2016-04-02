'use strict';

var
jade = require('jade'),
path = require('path');

module.exports = jade.compileFile(path.join(__dirname, 'forgot-password.jade'), {
  // extra options here
});
