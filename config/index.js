'use strict';

var
winston = require('winston'),
envVar = process.env;

module.exports = {
  debugging: (parseInt(envVar.CX_DEBUG) === 1),
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
  server: {
    api: {
    },
    backend: {
    },
    authenticator: {
    }
  },
  secret: {

    //
    // Generate a new token secret:
    // node scripts/new-private-key.js
    //

    token: envVar.CX_SECRET_TOKEN || 'an invalid key error will occur',
    ws: envVar.CX_SECRET_WS || 'some random string here'
  },
  session: {
    durationShortLived: 120000,    // 1 hr
    durationLongLived: 7 * 86400000 // 7 days
  }
};
