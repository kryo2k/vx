'use strict';

var
Q = require('q'),
_ = require('lodash'),
autobahn = require('autobahn'),
autobahnCon = require('../../common/components/autobahn-connection'),
ellipsis = require('../../common/components/ellipsis'),
ModelUser = require('../../common/api/user/user.model');

var
TAG = 'Backend:',
logSub = function (args, b, c) {
  if(arguments.length < 3) return;

  var
  stype = !!c.publication ? 'publication' : (!!c.publisher ? 'publisher' : 'unknown'),
  sval  = !!c.publication ? c.publication : (!!c.publisher ? c.publisher : null);

  console.log('>>> %s[%s:%j] #%d %j', c.topic, stype, sval, args.length, args);
};

var
virtUserSub = { // hash for all virtual user subscriptions (id => topic)
},
userSessions = { // hash for all connected session => user promises (populated on join)
},
userSessionClear = function (id) {
  delete userSessions[id];
  return id;
},
userSessionSet = function (id, promise) {
  userSessions[id] = promise;

  return promise.then(function (user) {

    if(!user) {
      userSessionClear(id); // remove the reference to itself
      return Q.reject(new Error('Invalid user session')); // return rejected promise (incase)
    }

    return user;
  });
},
userSessionAdhoc = function (id, authid) {
  var
  elAuthId    = ellipsis(authid, 8, 8),
  elSessionId = ellipsis(id);
  return userSessionSet(id, Q.nfcall(ModelUser.findUserByToken.bind(ModelUser), authid))
    .then(function (user) {
      console.log(TAG + ' [SESSION] (%s) SUCCESS: (authId: %s, user: %j)', elSessionId, elAuthId, user.profileMinimal);
      return user;
    }, function (err) {
      console.log(TAG + ' [SESSION] (%s) FAIL: Unable to resolve user (authId: %s) [%s]', elSessionId, elAuthId, err.message);
      return err;
    });
},
userSessionGet = function (id, session) {
  var
  elSessionId = ellipsis(id);

  if(!userSessions.hasOwnProperty(id)) { // see if this is a previously connected user

    if(session) {
      console.log(TAG+' attempting to re-load an existing session (%s).', elSessionId);

      return session.call("wamp.session.get", [id])
        .then(function(res) {
          if(!res) return Q.reject(new Error('No result returned from session query.'));
          if(res.authrole !== 'user') return Q.reject(new Error('Non-user role attempted user action.'));
          if(!res.authid) return Q.reject(new Error('Unable to re-load session id, most likely non-existent.'));

          return userSessionAdhoc(id, res.authid);
        });
    }

    return Q.reject(new Error('Invalid or non-existent session id ('+ String(id) +')'))
  }

  return Q.when(userSessions[id]);
};

//
// Meta-event handlers
//

function sessionOnJoin(session) {
  return function (args, b, c) {
    var
    authiz  = args[0],
    id      = authiz.session,
    authid  = authiz.authid,
    role    = authiz.authrole,

    elAuthId    = ellipsis(authid, 8, 8),
    elSessionId = ellipsis(id);

    console.log(TAG + ' [JOIN] (role: %s, authId: %s, sessionId: %s)', role, elAuthId, elSessionId);

    if(role !== 'user') { // no privilege checking needed
      console.log('system component identified, no further action taken.');
      return;
    }

    // Resolve and validate the token of the user (should already be validated)
    return userSessionAdhoc(id, authid);
  };
}

function sessionOnLeave(session) {
  return function (args, b, c) {
    logSub.apply(this, arguments);

    var
    id = args[0];

    userSessionGet(id).then(function (user) {
      console.log(TAG + ' [LEAVE] (sessionId: %s, user: %j)', ellipsis(id), user.profileMinimal);
    });

    // clean-up the promise for this user in the hash
    userSessionClear(id);
  };
}

function subOnCreate (session) {
  return function (args, b, c) {
    logSub.apply(this, arguments);

    var id = args[0], subscr = args[1];

    userSessionGet(id, session).then(function (user) {
      console.log(TAG + ' [SUB CREATE] (sessionId: %s, user: %j, uri: %s)', ellipsis(id), user.profileMinimal, subscr.uri);
    });
  };
}

function subOnSubscribe(session) {
  return function (args, b, c) {
    var
    id = args[0], subto = args[1],
    elSessId = ellipsis(id),
    elSubId = ellipsis(subto),
    topic = virtUserSub[subto].topic;

    if(virtUserSub.hasOwnProperty(subto)) {
      return userSessionGet(id, session).then(function (user) {
        console.log(TAG+' subscription to (%s:%s) succeeded (sessionId: %s)', elSubId, topic, elSessId);

        // var
        // pusId = pushUserSubscription(user, id, subto);

        //
        // All data here needs to be specific to the user subscribed above.
        //

      });
    }

    // pass-thru subscription if not a virtual user subscription
    logSub.apply(this, arguments);
    return args;
  };
}

function subOnUnsubscribe(session) {
  return function (args, b, c) {
    logSub.apply(this, arguments);
  };
}

function subOnDelete(session) {
  return function (args, b, c) {
    logSub.apply(this, arguments);
  };
}

function virtualUserSubscription(session, uri, handler) {
  console.log(TAG + ' creating virtual user subscription (uri: %s)', uri);
  return session.subscribe(uri, _.isFunction(handler) ? handler : function (v) { return v; })
    .then(function (reg) {
      console.log(TAG + ' virtual subscription (uri: %s) created with id (%s:%s)', uri, ellipsis(reg.id), reg.topic);
      virtUserSub[reg.id] = reg;
      return reg;
    }, function (err) {
      console.error(TAG + ' unable to create virtual subscription (uri: %s) [%s].', uri, err);
      return err;
    });
}

//
// Backend procedure implementations
//

function procRequestChannel(args) {
  console.log('user is requesting a channel', arguments);
}

//
// Export bootstrapping function
//

module.exports = function () {

  var
  connection = autobahnCon(process.argv[3], process.argv[4], process.argv[5], process.argv[6]),
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

  connection.onopen = function (session, details) {
    console.log(TAG, 'Connected to wamp server');

    // virtual user topic subscriptions
    virtualUserSubscription(session, 'vx.user.notifications');

    // meta-event subscriptions
    session.subscribe('wamp.session.on_join',             sessionOnJoin(session))    .then(slog, slog);
    session.subscribe('wamp.session.on_leave',            sessionOnLeave(session))   .then(slog, slog);
    session.subscribe('wamp.subscription.on_create',      subOnCreate(session))      .then(slog, slog);
    session.subscribe('wamp.subscription.on_subscribe',   subOnSubscribe(session))   .then(slog, slog);
    session.subscribe('wamp.subscription.on_unsubscribe', subOnUnsubscribe(session)) .then(slog, slog);
    session.subscribe('wamp.subscription.on_delete',      subOnDelete(session))      .then(slog, slog);

    // custom procedures
    // session.register('vx.user.requestChannel', procRequestChannel).then(slog, slog);
  };

  connection.open();
};
