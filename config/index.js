'use strict';

var
winston = require('winston'),
nodemailer = require('nodemailer'),
envVar = process.env;

var debugging = (parseInt(envVar.CX_DEBUG) === 1);

module.exports = {
  debugging: debugging,
  domain: envVar.CX_DOMAIN || 'http://localhost',
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
  recaptcha: {
    siteKey: envVar.CX_RECAPTCHA_SITEKEY || 'INVALIDSITEKEY',
    secretKey: envVar.CX_RECAPTCHA_SECRET || 'INVALIDSECRETKEY',
    verbose: debugging
  },
  mailer: {
    transport: nodemailer.createTransport({
      transport: 'ses', // loads nodemailer-ses-transport
      accessKeyId: envVar.CX_AWS_ACCESSKEYID || 'AWSACCESSKEY',
      secretAccessKey: envVar.CX_AWS_ACCESSSECRET || 'AWS/Secret/key'
    }),
    fromSystem: 'Ticonerd <no-reply@ticonerd.com>'
  },
  contact: {
    sendTo:   envVar.CX_CONTACT_ADDR || false,
    sendFrom: envVar.CX_CONTACT_FROM || 'System <system@site.com>',
    subject:  envVar.CX_CONTACT_SUBJ || 'New contact message'
  },
  forgotPw: {
    sendFrom: envVar.CX_FORGOTPW_FROM || envVar.CX_CONTACT_FROM || 'System <system@site.com>',
    subject:  envVar.CX_FORGOTPW_SUBJ || 'Request to reset your password.'
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

    token: envVar.CX_SECRET_TOKEN || 'an invalid key error will occur'
  },
  session: {
    durationShortLived: 120000,    // 1 hr
    durationLongLived: 7 * 86400000 // 7 days
  }
};
