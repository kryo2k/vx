'use strict';

var
Q = require('q'),
autobahnSvc = require('../components/autobahn-service'),
compose = require('composable-middleware'),
format = require('util').format;

module.exports = function (options) {
  options = options || {};

  return compose()
    .use(function (req, res, next) {

      Object.defineProperty(res, 'autobahn', {
        get: function () {
          return autobahnSvc.session;
        }
      });

      res.abRegister = function() {
        var ab = res.autobahn;
        return ab.register.apply(ab, arguments);
      };

      res.abCall = function() {
        var ab = res.autobahn;
        return ab.call.apply(ab, arguments);
      };

      res.abPublish = function() {
        var ab = res.autobahn;
        return ab.publish.apply(ab, arguments);
      };

      res.abSubscribe = function() {
        var ab = res.autobahn;
        return ab.subscribe.apply(ab, arguments);
      };

      res.abUnsubscribe = function() {
        var ab = res.autobahn;
        return ab.unsubscribe.apply(ab, arguments);
      };

      req.userSubscriptionSessions = function (topic, user) {
        user = user || req.user;

        if(!user) return Q.reject(new Error('User was not found in request.'));

        var ab = res.autobahn, verifier = user.tokenVerify.bind(user);

        return ab.call('wamp.subscription.lookup', [topic, { match: 'exact' }])
          .then(function (subscriptionId) {
            if(!subscriptionId) {
              return [];
            }

            return ab.call('wamp.subscription.list_subscribers', [subscriptionId]);
          })
          .then(function (sessionIds) {
            if(!sessionIds || !sessionIds.length) {
              return [];
            }

            // loop thru session ids and filter the one(s) we're looking for:
            return sessionIds.reduce(function (promise, id) {
              return promise.then(function (result) {
                return ab.call('wamp.session.get', [id])
                  .then(function (info) {
                    if(!info || info.authrole !== 'user' || !verifier(info.authid)) {
                      return result;
                    }

                    result.push(id);

                    return result;
                  });
              });
            }, Q.when([]));
          });
      };

      res.pushNotify = function (type, data, meta, user) {
        var topic = 'vx.user.notifications';

        // find all eligible session ids
        return req.userSubscriptionSessions(topic, user)
          .then(function (sessions) {
            var published = sessions.length;

            if(published) {
              res.abPublish(topic, [{ type: type, data: data }], meta, {
                eligible: sessions
              });
            }

            return published;
          });
      };

      next();
    });
};
