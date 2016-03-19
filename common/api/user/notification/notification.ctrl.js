'use strict';

var
Q = require('q'),
InputError = require('../../../components/error-input'),
paginateUtil = require('../../../components/paginate-util'),
mongoUtil = require('../../../components/mongo-util'),
model = require('./notification.model');

// @auth
// @method POST
exports.markRead = function (req, res, next) {
  var notificationIds = mongoUtil.arrayOfObjectId(req.body);

  if(!notificationIds) {
    return next(new InputError('No notification IDs were provided to mark as read.'));
  }

  model.update({ user: req.user, _id: { $in: notificationIds } }, { unread: false }, { multi: true }, function (err) {
    if(err) return next(err);
    res.respondOk();
  });
};

// @auth
// @method GET
exports.count = function (req, res, next) {
  var
  countFN = model.count.bind(model);

  Q.all([
    // total read
    Q.nfcall(countFN, { user: req.user, unread: false }),
    // total unread
    Q.nfcall(countFN, { user: req.user, unread: true })
  ])
  .spread(function (countRead, countUnread) {
    res.respondOk({ read: countRead, unread: countUnread });
  })
  .catch(next);
};

// @auth
// @method GET
exports.notifications = function (req, res, next) {
  var criteria = { user: req.user };

  if(parseInt(req.query.unreadOnly) === 1) {
    criteria.unread = true;
  }
  else if(parseInt(req.query.readOnly) === 1) {
    criteria.unread = false;
  }

  model.paginate(criteria, {
    select: '_id type typeData unread created',
    sort: { 'created': -1 },
    page: paginateUtil.page(req.query),
    limit: paginateUtil.offset(req.query)
  }, function (err, docs) {
    if(err) {
      return next(err);
    }

    res.respondOk(docs);
  });
};