'use strict';

var autobahn = require('autobahn');

module.exports = function (wampCfg, serviceCfg) {

  var app = this;

  var
  connection = new autobahn.Connection(wampCfg);

  connection.onopen = function (session, details) {
    console.log('UserNotification module: Connected to wamp server');
  };

  connection.open();
};
