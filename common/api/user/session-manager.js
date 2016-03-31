'use strict';

//
// Class which is responsible for hot-loading sessions and deregistering them programatically.
// Designed to run in memory -- beware.
//

var
Q = require('q'),
_ = require('lodash'),
inherits = require('util').inherits,
format = require('util').format,
ellipsis = require('../../components/ellipsis'),
mongoUtil = require('../../components/mongo-util'),
UniqueArray = require('../../components/unique-array'),
ModelUser = require('./user.model');

function UserSessionArray(userId) {
  UniqueArray.call(this);

  var promise = null;

  function loadProfile () {
    if(!mongoUtil.isObjectId(userId)) {
      return Q.reject(new Error('Invalid user id was provided.'));
    }

    return Q.nfcall(ModelUser.findById.bind(ModelUser), userId, '_id name');
  }

  this.reloadProfile = function () {
    promise = loadProfile();
    return promise;
  };

  this.reloadProfile();

  Object.defineProperties(this, {
    profile: {
      get: function () {
        return Q.when(promise);
      }
    }
  });
}

inherits(UserSessionArray, UniqueArray);

function UserSessionManager() {
  var
  countUsers = 0,
  countSessions = 0,

  idxUserSessions = {},
  idxSessionUsers = {},

  sessions = {
  };

  Object.defineProperties(this, {
    countUsers: {
      get: function () { return countUsers; }
    },
    countSessions: {
      get: function () { return countSessions; }
    },
    allUserIds: {
      get: function () {
        return Object.keys(idxUserSessions);
      }
    },
    allSessionIds: {
      get: function () {
        return Object.keys(idxSessionUsers);
      }
    }
  });

  function sessionModFn(method, sessionId, session) {
    var fn = session[method]||_.noop;
    countSessions -= session.length;
    fn.call(session, sessionId);
    countSessions += session.length;
  }

  this.toObject = function () {
    return {
      countUsers:    countUsers,
      countSessions: countSessions
    };
  };

  this.toIndexes = function () {
    return {
      users: this.allUserIds.reduce(function (p, id) {
        p[id] = idxUserSessions[id].toObject();
        return p;
      }, {}),
      sessions: this.allSessionIds.reduce(function (p, id) {
        p[id] = idxSessionUsers[id].toObject();
        return p;
      }, {})
    };
  };

  this.toString = function (showIndexes) {
    return 'UserSessionManager('+JSON.stringify(this.toObject()) + (!!showIndexes ? (','+JSON.stringify(this.toIndexes())) : '') +')';
  };

  this.add = function (userId, sessionId) {

    if(!idxUserSessions.hasOwnProperty(userId)) {
      idxUserSessions[userId] = new UserSessionArray(userId);
      countUsers++;
    }

    sessionModFn('add', sessionId, idxUserSessions[userId]);

    if(!idxSessionUsers.hasOwnProperty(sessionId)) {
      idxSessionUsers[sessionId] = new UniqueArray();
    }

    idxSessionUsers[sessionId].add(userId);

    return this;
  };

  this.remove = function (userId, sessionId) {
    if(idxUserSessions.hasOwnProperty(userId)) {
      var ses = idxUserSessions[userId];

      sessionModFn('remove', sessionId, ses);

      if(ses.length === 0) {
        delete idxUserSessions[userId];
        countUsers--;
      }
    }

    if(idxSessionUsers.hasOwnProperty(sessionId)) {
      var usr = idxSessionUsers[sessionId];
      usr.remove(sessionId);
      if(usr.length === 0) {
        delete idxSessionUsers[sessionId];
      }
    }

    return this;
  };

  this.users = function (userId) {
    return idxUserSessions[userId] || false;
  };

  this.sessions = function (sessionId) {
    return idxSessionUsers[sessionId] || false;
  };

  this.sessionUserId = function (sessionId) {
    var ses = this.sessions(sessionId);

    if(!ses) {
      return false;
    }

    return ses.get(0);
  };

  this.reset = function () {
    idxUserSessions = {};
    idxSessionUsers = {};

    return this;
  };
}

module.exports = UserSessionManager;
