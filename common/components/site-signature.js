'use strict';

var
_      = require('lodash'),
crypto = require('crypto'),
format = require('util').format,
config = require('../../config');

const
keySerializeAs  = 'hex',
cipSerializeAs  = 'hex',
keyAlgorithm    = 'secp256k1',
cipherAlgorithm = 'aes-256-ctr';

function safeJsonParse(json) {
  var decoded = false;

  try {
    decoded = JSON.parse(json);
  }
  catch(e) {}

  return decoded;
}

function createECDH() {
  return crypto.createECDH(keyAlgorithm);
}

function createPrivateKey() {
  var
  ecdh = createECDH();
  ecdh.generateKeys();
  return ecdh;
}

function loadECDH(privateKey) {

  if(!privateKey) {
    throw new Error('No private key was provided.');
  }

  var
  ecdh = createECDH();
  ecdh.setPrivateKey(privateKey, keySerializeAs);

  return ecdh;
}

function createCipher(secret) {
  return crypto.createCipher(cipherAlgorithm, secret);
}

function createDecipher(secret) {
  return crypto.createDecipher(cipherAlgorithm, secret);
}

function computeECDHSecret(ecdh, publicKey) { // if no pubkey, secret is self-signing
  return ecdh.computeSecret(publicKey||ecdh.getPublicKey());
}

function computePrivateKeySecret(privateKey, publicKey) {
  var ecdh = loadECDH(privateKey);
  return computeECDHSecret(ecdh, publicKey);
}

function encrypt(secret, message, inputAs) {
  var cipher = createCipher(secret);
  return cipher.update(message, inputAs||'utf8', cipSerializeAs) + cipher.final(cipSerializeAs);
}

function encryptObj(secret, v) {
  return encrypt(secret, JSON.stringify(v));
}

function decrypt(secret, message, outputAs) {
  var decipher = createDecipher(secret);
  outputAs = outputAs || 'utf8';
  return decipher.update(message, cipSerializeAs, outputAs) + decipher.final(outputAs);
}

function decryptObj(secret, v) {
  return safeJsonParse(decrypt(secret, v));
}

var
privateKey = false;

//
// Throws an error if key is not loaded properly.
//
function requirePrivateKey() {

  var
  sitePrivateKey = config.secret.token;

  if(privateKey) { // cached
    return privateKey;
  }

  try {
    privateKey = loadECDH(sitePrivateKey);
  }
  catch(e) {
    throw new Error(format('Site token signature private key (%s) was in an invalid format for %s algorithm.', sitePrivateKey, keyAlgorithm));
  }

  return privateKey;
}

//////// EXPORTS

exports.createPrivateKey = function () {
  return createPrivateKey().getPrivateKey(keySerializeAs);
};

exports.sign = function (string, publicKey) {
  if(!_.isString(string)) { // automatically encode into a string
    throw new Error('Non-string was supplied to sign.');
  }

  requirePrivateKey();
  return encryptObj(computeECDHSecret(privateKey, publicKey), [string]);
};

exports.signObj = function (v, publicKey) {
  requirePrivateKey();
  return sign(JSON.stringify(v), publicKey);
};

exports.parse = function (string, publicKey) {
  requirePrivateKey();

  if(!string) { // don't waste cycles
    return false;
  }

  var dec = decryptObj(computeECDHSecret(privateKey, publicKey), string);
  return !_.isArray(dec) ? false : dec.shift();
};

exports.parseObj = function (string, publicKey) {
  requirePrivateKey();

  if(!string) { // don't waste cycles
    return false;
  }

  return safeJsonParse(parse(string, publicKey));
};
