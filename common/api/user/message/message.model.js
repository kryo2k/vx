'use strict';

var
mongoose = require('mongoose'),
Schema = mongoose.Schema;

var
UserMessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  message: {
    type: String,
    require: true
  },
  unread: {
    type: Boolean,
    default: true
  },
  removeFromSender: {
    type: Boolean,
    default: false
  },
  removeFromReceiver: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  }
});

UserMessageSchema.statics = {
};

UserMessageSchema.methods = {
};

UserMessageSchema.plugin(require('mongoose-paginate'));

module.exports = mongoose.model('UserMessage', UserMessageSchema);