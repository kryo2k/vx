'use strict';

var
_ = require('lodash'),
crypto = require('crypto'),
Q = require('q'),
autobahn = require('autobahn'),
autobahnSvc = require('../../common/components/autobahn-service'),
ellipsis = require('../../common/components/ellipsis'),
config = require('../../config'),
ModelUser = require('../../common/api/user/user.model'),
UserSessionManager = require('../../common/api/user/session-manager');

var
TAG = 'Authenticator:',
activeSessions = new UserSessionManager();

var redumpTimeout;

function dumpActiveSessions() {
  console.log(TAG + ' activeSessions:', activeSessions.toString());

  if(redumpTimeout) {
    clearTimeout(redumpTimeout);
    redumpTimeout = null;
  }

  redumpTimeout = setTimeout(dumpActiveSessions, 15000);
}

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

    console.log('User (%s:%s) authenticated via sockets.', user.name, ellipsis(authid, 8, 8));

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

function findUserSessions(args) {
  var
  userId = args[0],
  userSessions = activeSessions.users(userId);

  if(userSessions) {
    userSessions = userSessions.toObject();
  }

  return userSessions;
}

function findSessionUserIds(args) {
  var
  sessionId = args[0],
  sessionUser = activeSessions.sessions(sessionId);

  if(sessionUser) {
    sessionUser = sessionUser.toObject();
  }

  return sessionUser;
}

function findSessionUserId(args) {
  var uids = findSessionUserIds(args);
  if(!uids) return uids;
  return uids[0];
}

function sessionOnJoin(session) {
  return function (args, meta) {

    var
    authiz  = args[0],
    id      = authiz.session,
    authid  = authiz.authid,
    role    = authiz.authrole,

    elAuthId    = ellipsis(authid, 8, 8),
    elSessionId = ellipsis(id);

    if(role !== 'user') { // ignore other connections
      console.log(TAG + ' [SYS:JOIN] (role: %s, authId: %s, sessionId: %s)', role, elAuthId, elSessionId);
      return;
    }

    var userId = ModelUser.tokenId(authid);

    if(!userId) { // should never happen because of authenticator
      console.error(TAG + ' [ERROR] AuthId: %s could not find user id!!', elAuthId);
      return
    }

    activeSessions.add(userId, id);
    dumpActiveSessions();

    console.log(TAG + ' [JOIN] (authId: %s, sessionId: %s, user id: %s)', elAuthId, elSessionId, ellipsis(userId));

    activeSessions.users(userId).profile.then(function (userProfile) {
      console.log(TAG + ' [PROFILE] (authId: %s, sessionId: %s, user: %j)', elAuthId, elSessionId, userProfile.profileMinimal);
    });
  };
}

function sessionOnLeave(session) {
  return function (args, meta) {

    var
    id = args[0],
    userId = activeSessions.sessionUserId(id),
    userProfile = Q.when(!!userId ? activeSessions.users(userId).profile : false);

    if(userId) {
      activeSessions.remove(userId, id);
      dumpActiveSessions();
    }

    userProfile.then(function(profile) {

      if(!profile) {
        console.log(TAG + ' [NO PROFILE] User (%s) left with no profile loaded (sessionId: %s)', userId, ellipsis(id));
        return;
      }

      console.log(TAG + ' [LEAVE] (sessionId: %s, user: %j)', ellipsis(id), profile.profileMinimal);
    });
  };
}

function wampSessionCount(session) {
  return session.call('wamp.session.count');
}

function wampSessionList(session) {
  return session.call('wamp.session.list');
}

function wampSessionInfo(session, id) {
  return session.call('wamp.session.get', [id]);
}

function populateActiveSessions(session) {
  activeSessions.reset();

  var
  defer = Q.defer(),
  whenFoundSessions = function (sessions) {
    return sessions.reduce(function (chain, id) {
      return chain.then(function (loaded) {
        return wampSessionInfo(session, id).then(function (info) {
          if(!info) return loaded;

          var authId = info.authid, authRole = info.authrole, elID = ellipsis(id), elAuthId = ellipsis(authId, 8);
          if(authRole !== 'user' || !authId) { // non-user session
            console.warn(TAG+' (%s:%s) Non-user session, ignoring population..', elID, authRole);
            return loaded;
          }

          var authUserId = ModelUser.tokenId(authId);

          if(!authUserId) {
            console.warn(TAG+' (%s:%s) Invalid-user id, ignoring population..', elID, elAuthId);
            return loaded;
          }

          console.log(TAG+' Pushing active session {autoId: %s, userId: %j}', elAuthId, ellipsis(authUserId));

          return loaded.concat(activeSessions.add(authUserId, id));
        });
      });
    }, Q.resolve([]))
    .then(defer.resolve.bind(defer));
  },
  whenCountHas = function () {
    return wampSessionList(session)
      .then(function (sessions) {
        if(!sessions || !sessions.length) {
          console.log(TAG+' No active sessions were loaded.');
          return defer.resolve(false);
        }

        return whenFoundSessions(sessions);
      });
  },
  checkCount = function() {
    return wampSessionCount(session)
      .then(function (num) {
        if(num === 0) {
          console.log(TAG+' No active sessions to populate.');
          return defer.resolve(false);
        }

        console.log(TAG+' Found %d active session(s).', num);
        return whenCountHas();
      });
  };

  checkCount().catch(defer.reject.bind(defer));

  return defer.promise;
}

module.exports = function () {
  autobahnSvc.on('open', function (session) {
    console.log(TAG, 'Connected to wamp server');

    var
    logGood = function (reg) { console.log(TAG + ' routine (%s:%s) was registered.', ellipsis(reg.id), reg.procedure); return reg; },
    logBad  = function (err) { console.log(TAG + ' routine failed to register (%j)', err); return err; },
    slog = function (reg) {
      if(reg.error) {
        return console.error('ERROR:', reg.error);
      }
      else if(reg.topic) {
        return console.log(TAG+' subscribed to (%s:%s)', ellipsis(reg.id), reg.topic);
      }
      else if(reg.procedure) {
        return console.log(TAG+' registered to (%s:%s)', ellipsis(reg.id), reg.procedure);
      }

      console.log('success (%j)', arguments);
    };

    session.register('vx.fn.findUserSessions', findUserSessions).then(logGood, logBad);
    session.register('vx.fn.findSessionUserId', findSessionUserId).then(logGood, logBad);
    session.register('vx.fn.findSessionUserIds', findSessionUserIds).then(logGood, logBad);

    session.subscribe('wamp.session.on_join',  sessionOnJoin(session))    .then(slog, slog);
    session.subscribe('wamp.session.on_leave', sessionOnLeave(session))   .then(slog, slog);

    populateActiveSessions(session).then(function (success) {
      dumpActiveSessions();
      session.register('vx.authenticate', authenticate).then(logGood, logBad);
    })
    .catch(function (err) {
      console.error(TAG+' Unable to populate active sessions:', err.stack);
    });
  });

  autobahnSvc.init(process.argv[3], process.argv[4], process.argv[5], process.argv[6]).start();
};
