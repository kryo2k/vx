'use strict';

var
_ = require('lodash'),
crypto = require('crypto'),
Q = require('q'),
autobahn = require('autobahn'),
autobahnSvc = require('../../common/components/autobahn-service'),
config = require('../../config'),
ModelUser = require('../../common/api/user/user.model');

var
TAG = 'Authenticator:';

function authenticate (args) {

  var
  realm = args[0],
  authid = args[1],
  details = args[2];

  var
  defer = Q.defer();

  ModelUser.findUserByToken(authid, function (err, user) {
    if(err) {
      return defer.reject(err);
    }
    if(!user) { // invalid token
      return defer.reject(new Error('Invalid authorization token.'));
    }

    var
    keylength  = 16,
    iterations = 100,
    salt       = crypto.randomBytes(keylength).toString('hex'),
    derived    = autobahn.auth_cra.derive_key(String(user._id), salt, iterations, keylength);

    console.log('User (%s: %s) authenticated via sockets (session id).', user.name, derived);

    defer.resolve({
      role: 'user',
      secret: derived,
      salt: salt,
      iterations: iterations,
      keylen: keylength
    });
  });

  return defer.promise;
}

module.exports = function () {
  autobahnSvc.on('open', function (session) {
    console.log(TAG, 'Connected to wamp server');

    var
    tagAuth = 'vx.authenticate';

    session.register(tagAuth, authenticate).then(
      function (reg) {
        console.log(TAG + ' routine (%s:%s) was registered.', reg.id, reg.procedure);
      },
      function (err) {
        console.log(TAG + ' routine (%s) failed to register (%s)', tagAuth, err);
      }
    );
  });

  autobahnSvc.init(process.argv[3], process.argv[4], process.argv[5], process.argv[6]).start();
};
