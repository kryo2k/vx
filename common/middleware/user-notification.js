'use strict';

var
Promise = require('mongoose').Promise,
compose = require('composable-middleware'),
InputError = require('../components/error-input'),
Notification = require('../api/user/notification/notification.model');

module.exports = function () {
  return compose()
    .use(function (req, res, next) {

      res.userNotify = function (type, typeData, cb, user) {
        user = user||req.user;

        if(!user) {
          return cb(new InputError('User to notify was not part of request.'));
        }

        var
        promise = new Promise(cb);

        user.addNotification(type, typeData, function (err, notification) {
          if(err) return promise.error(err);

          var
          notifyObj = notification.toObject(), // static object (non-model)
          metaPayload = { notificationId: notification._id };

          delete notifyObj.user;

          return res.pushNotification('new', notifyObj, metaPayload, null, user)
            .then(function (publishedTo) {
              notifyObj.publishedTo = publishedTo;
              promise.complete(notifyObj);

              res.fetchAndPushNotificationCount('newNotification', metaPayload, user);

              return notifyObj;
            })
            .catch(promise.error.bind(promise));
        })

        return promise;
      };

      res.fetchAndPushNotificationCount = function (invoker, invokerParams, user) {
        user = user||req.user;
        return Notification.fetchCounts(user, function (err, counts) {
          if(err) return console.error('Unsent error while fetching counts:', err);

          // push count change using sockets
          res.pushNotificationCount(counts, invoker, invokerParams, user);
          return counts;
        });
      };

      res.pushNotificationCount = function (counts, invoker, invokerParams, user) {
        return res.pushNotification('counts', counts, { invoker: invoker, invokerParams: invokerParams }, null, user);
      };

      res.pushNotification = function (reason, data, meta, opts, user) {
        return res.pushTopicUser('vx.user.notifications', [reason, data], meta, opts, user);
      };

      next();
    });
};
