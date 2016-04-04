'use strict';

var
_  = require('lodash'),
crypto  = require('crypto'),
mongoose = require('mongoose'),
owasp = require('owasp-password-strength-test'),
mongoUtil = require('../../components/mongo-util'),
InputError = require('../../components/error-input'),
SiteSignature = require('../../components/site-signature'),
AuthenticationError = require('../../components/error-authentication'),
config = require('../../../config'),
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
cipSerializeAs  = 'hex',
keyAlgorithm    = 'secp256k1',
cipherAlgorithm = 'aes-256-ctr';

var
UserSchema = new Schema({
  name: String,
  bio: String,
  phone: {
    home: String,
    mobile: String,
    work: String
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true // enforces uniqueness, but throws error.
  },
  disabled: Boolean,
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
.validate(function (email) {
   return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email);
}, 'The e-mail field cannot be empty.')

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
      this.invalidate('password', {
        value: val,
        message: this._lastPasswordErrors = results
      });
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
    this._encryptedPassword = pkey ? this.passwordEncode(val) : false;
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
    return this._privateKey||false;
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

UserSchema.virtual('profile')
  .get(function () {
    return { // return clean object
      _id: this._id,
      name: this.name,
      bio: this.bio,
      email: this.email,
      phone: this.phone,
      publicKey: this.publicKey.toString(keySerializeAs),
      created: this.created
    };
  });

UserSchema.virtual('mailContact')
  .get(function () {
    if(this.name) {
      return this.name + ' <' + this.email + '>';
    }

    return this.email;
  });

UserSchema.virtual('profileMinimal')
  .get(function () {
    return {
      _id: this._id,
      name: this.name
    };
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

var ML = 24, NONCE = Date.now();

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
  createToken: function (signer, longTerm) {
    return SiteSignature.sign(signer.tokenSign(this.sessionDuration(longTerm), { longTerm: longTerm }));
  },
  parseToken: function (signedToken) {
    return SiteSignature.parse(signedToken);
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
  },
  tokenJoin: function (id, payload) {
    return String(id) + payload;
  },
  tokenId: function (token, isParsed) {
    token = isParsed ? token : this.parseToken(token);
    if(!_.isString(token) || token.length < ML) return false;
    return mongoUtil.getObjectId(token.substring(0, ML));
  },
  tokenPayload: function (token, isParsed) {
    token = isParsed ? token : this.parseToken(token);
    var tlen = token.length;
    if(!_.isString(token) || tlen < ML) return false;
    return token.substring(ML, tlen);
  },
  tokenSplit: function (token) {
    var result = {
      id: this.tokenId(token),
      payload: this.tokenPayload(token)
    };

    if(!result.id || !result.payload) {
      return false;
    }

    return result;
  },
  findUserByToken: function (token, cb) {
    var
    uid = this.tokenId(token),
    promise = new mongoose.Promise(cb);

    if(!uid) { // save cycles
      promise.complete(false);
      return promise;
    }

    this.findById(uid, function (err, doc) {
      if(err) {
        return promise.error(err);
      }
      if(!doc || !doc.tokenVerify(token)) {
        return promise.complete(false);
      }

      promise.complete(doc);
    });

    return promise;
  },
  sessionDuration: function (longTerm) {
    return Date.now() + (longTerm
      ? config.session.durationLongLived
      : config.session.durationShortLived);
  },
  authenticate: function (email, password, longTerm, cb) {
    var
    promise = new mongoose.Promise(cb),
    createToken = this.createToken.bind(this);

    if(!email) {
      promise.error(new AuthenticationError('E-mail address was not provided.'));
      return promise;
    }
    else if(!password) {
      promise.error(new AuthenticationError('Password was not provided.'));
      return promise;
    }

    this.findOne({
      email: email,
      disabled: { $ne: true }
    }, function (err, doc) {
      if(err) {
        return promise.error(err);
      }
      if(!doc || (doc.password !== password)) {
        return promise.error(new AuthenticationError('Invalid username/password combination.', {
          user: email,
          password: password,
          invalidUser: !doc,
          invalidPass: !!doc
        }));
      }

      promise.complete(createToken(doc, longTerm));
    });

    return promise;
  }
};

UserSchema.methods = {
  applyUpdate: function (data) {
    data = data || {};
    return ['name', 'phone', 'bio'].reduce(function (p, c) {
      if(data.hasOwnProperty(c)) {
        p[c] = data[c];
      }
      return p;
    }, this);
  },
  addNotification: function (type, typeData, cb) {
    var
    promise = new mongoose.Promise(cb);

    this.model('UserNotification').create({ user: this, type: type, typeData: typeData }, function (err, doc) {
      if(err) return promise.error(err);
      promise.complete(doc);
    });

    return promise;
  },
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
  encryptObj: function (publicKey, v) {
    return this.encrypt(publicKey, JSON.stringify(v));
  },
  decrypt: function (publicKey, message, outputAs) {
    var decipher = this.createDecipher(publicKey);
    outputAs = outputAs || 'utf8';
    return decipher.update(message, cipSerializeAs, outputAs) + decipher.final(outputAs);
  },
  decryptObj: function (publicKey, v) {
    var
    decrypted = this.decrypt(publicKey, v),
    decoded = false;

    try {
      decoded = JSON.parse(decrypted);
    }
    catch(e) {}

    return decoded;
  },

  resetPrivateKey: function () { // unsaved!!
    this._privateKey = this.constructor.createPrivateKey();
    return this;
  },
  sendMessage: function (receiver, message, cb) {
    var promise = new mongoose.Promise(cb);
    return promise;
  },
  passwordEncode: function (plaintext) {
    return this.encrypt(this.publicKey, plaintext);
  },
  tokenSign: function (expiresOn, data) {
    var payload = _.extend({}, data, {
      iAt: Date.now(),
      uID: this._id
    });

    if(expiresOn) {
      var
      ms = _.isNumber(expiresOn)
        ? expiresOn
        : false;

      if(_.isString(expiresOn)) {
        ms = Date.parse(ms);
      }
      else if(expiresOn instanceof Date) {
        ms = expiresOn.getTime();
      }

      payload.eAt = isNaN(ms) ? undefined : ms;
    }

    payload.nonce = (++NONCE);

    return this.constructor.tokenJoin(this._id, this.encryptObj(this.publicKey, payload));
  },
  tokenParse: function (token) {
    var
    parsed, spl = this.constructor.tokenSplit(token);
    if(!spl || !mongoUtil.isIdEqual(this._id, spl.id)) { // ensure decoded and belongs to this user (before starting)
      return false;
    }

    parsed = this.decryptObj(this.publicKey, spl.payload);

    if(parsed) { // further validate the token
      if(!mongoUtil.isIdEqual(this._id, parsed.uID)) { // encrypted uID must belong to this user
        return false;
      }
      if(parsed.eAt && Date.now() >= parsed.eAt) { // must be greater than now.
        return false;
      }
    }

    return parsed;
  },
  tokenVerify: function (token) {
    return this.tokenParse(token) !== false;
  },
  tokenTTL: function (token) {
    var parsed = this.tokenParse(token);
    if(!parsed) return false;
    if(!parsed.eAt) return Infinity;

    return parsed.eAt - Date.now();
  }
};

UserSchema.plugin(require('mongoose-acl').subject, {
  key: function() {
    return 'user:' + this._id;
  }
});
UserSchema.plugin(require('mongoose-paginate'));

module.exports = mongoose.model('User', UserSchema);
