'use strict';

var
autobahn = require('autobahn');

module.exports = function (url, realm, authid, secret) {
  return new autobahn.Connection({
    url: url,
    realm: realm,
    authid: authid,
    authmethods: ["wampcra"],
    onchallenge: function (session, method, extra) {
      if (method === "wampcra") {
        return autobahn.auth_cra.sign(secret, extra.challenge);
      }
      else throw new Error('Invalid authentication method ('+method+').');
    }
  });
};
