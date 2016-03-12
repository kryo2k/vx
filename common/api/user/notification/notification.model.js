
'use strict';

var
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
  unread: Boolean,
  created: {
    type: Date,
    default: Date.now
  }
});

UserNotificationSchema.statics = {
};

UserNotificationSchema.methods = {
};

UserNotificationSchema.plugin(require('mongoose-paginate'));

module.exports = mongoose.model('UserNotification', UserNotificationSchema);