'use strict';

var
Q = require('q'),
mongoose = require('mongoose'),
Schema = mongoose.Schema;

var
UserNotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  type: {
    type: String,
    require: true
  },
  typeData: Object,
  created: {
    type: Date,
    default: Date.now
  },
  unread: {
    type: Boolean,
    default: true
  },
  readOn: {
    type: Date,
    expires: 86400  // expire 1 day after being read
  }
});

UserNotificationSchema.statics = {
  fetchCounts: function (user, cb) {

    var
    promise = new mongoose.Promise(cb),
    countFN = this.count.bind(this);

    Q.all([
      // total read
      Q.nfcall(countFN, { user: user, unread: false }),
      // total unread
      Q.nfcall(countFN, { user: user, unread: true })
    ])
    .spread(function (countRead, countUnread) {
      return { read: countRead, unread: countUnread };
    })
    .then(promise.complete.bind(promise))
    .catch(promise.error.bind(promise));

    return promise;
  }
};

UserNotificationSchema.methods = {
};

UserNotificationSchema.plugin(require('mongoose-paginate'));

module.exports = mongoose.model('UserNotification', UserNotificationSchema);
