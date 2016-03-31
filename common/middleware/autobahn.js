'use strict';

var
Q = require('q'),
_ = require('lodash'),
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

      req.userSessions = function (user) {
        user = user || req.user;

        if(!user) return Q.reject(new Error('User was not found in request.'));
        if(!_.isFunction(user.tokenVerify)) return Q.reject(new Error('User is not loaded properly, or has no token validator function.'));

        return res.autobahn.call('vx.fn.findUserSessions', [user._id.toString()]);
      };

      req.userSubscriptionSessions = function (topic, user) {
        user = user || req.user;

        if(!user) return Q.reject(new Error('User was not found in request.'));
        if(!_.isFunction(user.tokenVerify)) return Q.reject(new Error('User is not loaded properly, or has no token validator function.'));

        var
        ab = res.autobahn,
        verifier = user.tokenVerify.bind(user);

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

            return req.userSessions(user).then(function (userSessions) {
              if(!userSessions || !userSessions.length) {
                return [];
              }

              // restrict to user sessions only
              return sessionIds.filter(function (sesId) {
                return userSessions.indexOf(sesId) > -1;
              });
            });
          });
      };

      res.pushTopic = function (topic, args, meta, opts) {
        return res.abPublish(topic, args, meta, opts);
      };

      res.pushTopicUser = function (topic, args, meta, opts, user) {
        return req.userSessions(user)
          .then(function (sessions) {
            var published = sessions.length;
            if(!published) {
              return 0;
            }

            res.abPublish(topic, args, meta, _.merge({
              eligible: sessions
            }, opts));

            return published;
          });
      };

      next();
    });
};
