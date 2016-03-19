'use strict';

var
fs = require('fs'),
path = require('path');

module.exports = function (name) {

  var
  pathUse = null;

  var
  pathAsIndex = path.join(__dirname, name, 'index.js'),
  pathAsFile  = path.join(__dirname, name + '.js');

  if(fs.existsSync(pathAsIndex)) {
    pathUse = pathAsIndex;
  }
  else if(fs.existsSync(pathAsFile)) {
    pathUse = pathAsFile;
  }

  if(!pathUse) {
    return false;
  }

  return require(pathUse);
};