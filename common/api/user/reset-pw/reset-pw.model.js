'use strict';

var
_  = require('lodash'),
crypto  = require('crypto'),
mongoose = require('mongoose'),
config = require('../../../../config'),
mailer = require('../../../components/mailer'),
Schema = mongoose.Schema;

const
idSerializeAs = 'hex',
idBitLength   = 48;

var
UserResetPwSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  uniqueId: {
    type: String,
    require: true,
    unique: true
  },
  created: {
    type: Date,
    default: Date.now,
    expires: 15 * 60 // only good for 15 minutes
  }
});

UserResetPwSchema.virtual('resetUrl')
  .get(function () {
    return config.domain + '/#/forgot/' + this.uniqueId;
  });

UserResetPwSchema.statics = {
  createUniqueId: function () {
    return crypto.randomBytes(idBitLength).toString(idSerializeAs);
  },
  createForUser: function (user) {
    return new this({
      user: user,
      uniqueId: this.createUniqueId(),
      created: Date.now()
    });
  },
  fromEmail: function (email, cb) {
    var
    ResetPw = this,
    User = this.model('User'),
    promise = new mongoose.Promise(cb);

    User.findOne({ email: email }, function (err, doc) {
      if(err) {
        return promise.error(err);
      }

      // do not wait for validation
      promise.complete(true);

      if(doc) { // TODO: create a temporary reset password request
        var
        request = ResetPw.createForUser(doc);
        request.save(function (err) {
          if(err) return console.error(err);

          var
          cfg  = config.forgotPw,
          html = mailer.templates.forgotPassword({
            user: doc,
            request: request
          });

          // send email informing user
          mailer.queue({ from: cfg.sendFrom, to: doc.mailContact, subject: cfg.subject, html: html });
        });
      }
    });

    return promise;
  }
};

module.exports = mongoose.model('UserResetPw', UserResetPwSchema);
