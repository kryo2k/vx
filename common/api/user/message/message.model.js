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
  encrypt: function (message, sender, receiver) {
    return sender.encrypt(receiver.publicKey, message, 'utf8');
  },
  decrypt: function (message, sender, receiver) {
    return receiver.decrypt(sender.publicKey, message);
  }
};

UserMessageSchema.methods = {
  encrypt: function () {
    return this.constructor.encrypt(this.message, this.sender, this.receiver);
  },
  decrypt: function () {
    return this.constructor.decrypt(this.message, this.sender, this.receiver);
  },
  preview: function () {
    var decrypted = this.decrypt();
    if(!decrypted) return false;

    if(decrypted.length < 50) {
      return decrypted;
    }

    return decrypted.substring(0, 50) + '...';
  }
};

UserMessageSchema.plugin(require('mongoose-paginate'));

module.exports = mongoose.model('UserMessage', UserMessageSchema);
