'use strict';

var
Q = require('q'),
_ = require('lodash'),
format = require('util').format,
autobahn = require('autobahn'),
autobahnSvc = require('../../common/components/autobahn-service'),
ellipsis = require('../../common/components/ellipsis');

var
TAG = 'Backend:',
heartbeatInterval = 15000,
logSub = function (args, b, c) {
  if(arguments.length < 3) return;

  var
  stype = !!c.publication ? 'publication' : (!!c.publisher ? 'publisher' : 'unknown'),
  sval  = !!c.publication ? c.publication : (!!c.publisher ? c.publisher : null);

  console.log(TAG+' %s[%s:%j] #%d %j', c.topic, stype, sval, args.length, args);
};

function subOnCreate (session) {
  return function (args, b, c) {
    logSub.apply(this, arguments);
  };
}

function subOnSubscribe(session) {
  return function (args, b, c) {
    var id = args[0], subto = args[1];
    logSub.apply(this, arguments);
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

var
lHeartbeat,
clearHeartbeat = function () {
  if(lHeartbeat) {
    clearTimeout(lHeartbeat);
    lHeartbeat = null;
  }
};

function startHeartbeatLoop(session) {
  var
  loop = function (){
    clearHeartbeat();
    session.publish('vx.time', [Date.now()], {}, { acknowledge: true })
      .catch(function (error) {
        console.error(TAG+' heartbeat publication error', error);
      })
      .finally(function () {
        var
        now = Date.now(),
        nRemainder = heartbeatInterval - (now % heartbeatInterval);
        lHeartbeat = setTimeout(loop, nRemainder);
      });
  };

  loop();
}

//
// Export bootstrapping function
//

module.exports = function () {

  var
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

  autobahnSvc.on('close', clearHeartbeat);
  autobahnSvc.on('open', function (session, details) {
    startHeartbeatLoop(session);
    console.log(TAG, 'Connected to wamp server');

    // meta-event subscriptions
    session.subscribe('wamp.subscription.on_create',      subOnCreate(session))      .then(slog, slog);
    session.subscribe('wamp.subscription.on_subscribe',   subOnSubscribe(session))   .then(slog, slog);
    session.subscribe('wamp.subscription.on_unsubscribe', subOnUnsubscribe(session)) .then(slog, slog);
    session.subscribe('wamp.subscription.on_delete',      subOnDelete(session))      .then(slog, slog);

  });


  autobahnSvc.init(process.argv[3], process.argv[4], process.argv[5], process.argv[6]).start();
};
