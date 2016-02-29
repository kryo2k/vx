'use strict';

var
crypto  = require('crypto'),
mongoose = require('mongoose'),
Schema = mongoose.Schema;

const
keySerializeAs  = 'hex',
cipSerializeAs  = 'base64',
keyAlgorithm    = 'secp256k1',
cipherAlgorithm = 'aes-256-ctr';

var
UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    required: true,
    default: Date.now
  },
  _privateKey: {
    type: String,
    validate: {
      validator: function (v) {
        return /^[0-9a-f]{65}$/.test(v);
      },
      message: '{VALUE} is not a valid key.'
    }
  }
});

UserSchema.virtual('privateKey')
  .get(function () {
    return this._privateKey;
  })
  .set(function (val) {
    if(/^[0-9a-f]{64}$/.test(val)) {
      this._previousPrivateKey = this._privateKey;
      this._privateKey = val;
    }
  });

UserSchema.virtual('publicKey')
  .get(function () {
    return this.createECDH().getPublicKey();
  });

UserSchema.pre('save', function(next) {
  if (!this.isNew) return next();
  if (!this.privateKey) { // create a new private key for this user, only if not previously set
    this.privateKey = this.model('User').createPrivateKey();
    next();
  }
});

UserSchema.statics = {
  createECDH: function (privateKey) {
    var ecdh = crypto.createECDH(keyAlgorithm);

    if(privateKey) {
      ecdh.setPrivateKey(privateKey, keySerializeAs);
    }
    else {
      ecdh.generateKeys();
    }

    return ecdh;
  },
  createCipher: function (secret) {
    return crypto.createCipher(cipherAlgorithm, secret);
  },
  createDecipher: function (secret) {
    return crypto.createDecipher(cipherAlgorithm, secret);
  },
  createPrivateKey: function () {
    return this.createECDH(false).getPrivateKey(keySerializeAs);
  }
};

UserSchema.methods = {
  createCipher: function (publicKey) {
    return this.model('User').createCipher(this.computeSecret(publicKey));
  },
  createDecipher: function (publicKey) {
    return this.model('User').createDecipher(this.computeSecret(publicKey));
  },
  createECDH: function () {
    var pkey = this.privateKey;

    if(!pkey) {
      throw new Error('Private key has not been set for this user.');
    }

    return this.model('User').createECDH(pkey);
  },
  computeSecret: function (publicKey) {
    return this.createECDH().computeSecret(publicKey);
  },
  encrypt: function (publicKey, message, inputAs) {
    var cipher = this.createCipher(publicKey);
    return cipher.update(message, inputAs||'utf8', cipSerializeAs) + cipher.final(cipSerializeAs);
  },
  decrypt: function (publicKey, message, outputAs) {
    var decipher = this.createDecipher(publicKey);
    outputAs = outputAs || 'utf8';
    return decipher.update(message, cipSerializeAs, outputAs) + decipher.final(outputAs);
  }
};

module.exports = mongoose.model('User', UserSchema);
