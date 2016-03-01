'use strict';

var
crypto  = require('crypto'),
mongoose = require('mongoose'),
owasp = require('owasp-password-strength-test'),
Schema = mongoose.Schema;

owasp.config({
  allowPassphrases       : true,
  maxLength              : 128,
  minLength              : 8,
  minPhraseLength        : 20,
  minOptionalTestsToPass : 4
});

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
    required: true,
    lowercase: true,
    unique: true // enforces uniqueness, but throws error.
  },
  created: {
    type: Date,
    required: true,
    default: Date.now
  },
  _encryptedPassword: String,
  _privateKey: String
});

UserSchema
.path('email')
.validate(function (value, respond) { // unique check does NOT work for User.create({}, {}, ...)
  this.checkUniqueEmail(value).then(respond);
}, 'The specified email address is already in use.');

UserSchema.virtual('password')
  .get(function () {
    if (!this.privateKey || !this._encryptedPassword) { // not allowed to set if _privateKey isn't available
      return null;
    }

    return this.decrypt(this.publicKey, this._encryptedPassword);
  })
  .set(function (val) {
    delete this._lastPasswordErrors;

    var results;
    if((results = this.constructor.passwordTest(val)) !== true) { // invalid/insecure password
      this.invalidate('password', this._lastPasswordErrors = results);
    }

    if(!val) {
      return;
    }

    var pkey = this.privateKey;

    if (!pkey && this.isNew) { // hasn't set private key yet. reset/regenerate private key
      this.resetPrivateKey();
      pkey = this.privateKey;
    }

    this._plaintextPassword = val;
    this._encryptedPassword = pkey ? this.encrypt(this.publicKey, val) : false;
  });

UserSchema.virtual('passwordConfirm')
  .get(function () {
    return this._passwordConfirm;
  })
  .set(function (val) {
    this._passwordConfirm = val;
  });

UserSchema
  .path('_encryptedPassword')
  .validate(function(epw) {

    // console.log('Validating _encryptedPassword:');
    // console.log('-- argument   value: %j', epw);
    // console.log('-- plain-text value: %j', this._plaintextPassword);
    // console.log('-- confirm    value: %j', this._passwordConfirm);
    // console.log('-- encrypted  value: %j', this._encryptedPassword);
    // console.log('--      last errors: %j', this._lastPasswordErrors);

    if(this._lastPasswordErrors || this._plaintextPassword || this._passwordConfirm) {
      if(this._lastPasswordErrors) {
        this.invalidate('password', this._lastPasswordErrors);
      }
      else if(this._plaintextPassword !== this._passwordConfirm) {
        this.invalidate('passwordConfirm', 'Password confirmation does not match password.');
      }
    }

    if(this.isNew && !this._plaintextPassword) {
      this.invalidate('password', 'Password is required');
    }
  }, 'Password cannot be blank');

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
    this.resetPrivateKey();
  }
  if (!this._encryptedPassword) {
    return next(new Error('Password was not defined for user.'));
  }

  next();
});

UserSchema.statics = {
  checkUniqueEmail: function (email, existingUser, cb) {
    var
    promise = new mongoose.Promise(cb),
    eq = existingUser._id.equals.bind(existingUser._id);

    this.findOne({ email: email }, function (err, user) {
      if(err) {
        return promise.error(err);
      }

      if(user) {
        if(eq(user._id)) {
          return promise.complete(true);
        }

        return promise.complete(false);
      }

      promise.complete(true);
    });

    return promise;
  },
  passwordTest: function (password) {
    var
    result = owasp.test(password);

    if(!result.strong) {
      return result.errors;
    }

    return true;
  },
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
  checkUniqueEmail: function (email, cb) {
    return this.constructor.checkUniqueEmail(email, this, cb);
  },
  createCipher: function (publicKey) {
    return this.constructor.createCipher(this.computeSecret(publicKey));
  },
  createDecipher: function (publicKey) {
    return this.constructor.createDecipher(this.computeSecret(publicKey));
  },
  createECDH: function () {
    var pkey = this.privateKey;

    if(!pkey) {
      throw new Error('Private key has not been set for this user.');
    }

    return this.constructor.createECDH(pkey);
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
  },
  resetPrivateKey: function () { // unsaved!!
    this._privateKey = this.constructor.createPrivateKey();
    return this;
  }
};

module.exports = mongoose.model('User', UserSchema);
