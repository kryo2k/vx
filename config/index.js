'use strict';

var
winston = require('winston'),
envVar = process.env;

module.exports = {
  debugging: (parseInt(envVar.CX_DEBUG) === 1),
  server: {
    port: envVar.CX_PORT || 9999,
    address: envVar.CX_ADDR || '0.0.0.0',
    component: envVar.CX_COMPONENT || 'test-json-rpc'
  },
  database: {
    uri: envVar.CX_MONGO_URI || 'mongodb://localhost:27017/test',
    options: {
    }
  },
  log: {
    transports: [ // only log to console
      new (winston.transports.Console)({ level: 'debug' })
    ]
  },
  secret: {
    token: envVar.CX_SECRET_TOKEN || '-- something random --',
  },
  session: {
    durationShortLived: 3600000,    // 1 hr
    durationLongLived: 7 * 86400000 // 7 days
  }
};