'use strict';

var
Q = require('q'),
paginateUtil = require('../../../components/paginate-util'),
model = require('./notification.model');

// @auth
// @method GET
exports.notificationCount = function (req, res, next) {
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
  model.paginate({ user: req.user }, {
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