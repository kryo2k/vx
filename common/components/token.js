'use strict';


const
crypto = require('crypto'),
_ = require('lodash');

const alice = crypto.createECDH('secp256k1');
const bob = crypto.createECDH('secp256k1');
bob.generateKeys();
alice.generateKeys();

console.log('alice (pub): %j, bob (pub): %j', alice.getPublicKey(), bob.getPublicKey());

const alice_secret = alice.computeSecret(bob.getPublicKey());
const bob_secret   = bob.computeSecret(alice.getPublicKey());

console.log('alice (priv): %j, bob (priv): %j', alice_secret, bob_secret);

console.log(alice_secret.equals(bob_secret));





// function bufferOrString(v) {
//   return Buffer.isBuffer(v) || _.isString(v);
// }

// function normalizeInput(v) {
//   if (!bufferOrString(v)) {
//     v = JSON.stringify(v);
//   }
//   return v;
// }

// function createSigner(bits) {
//   return function (v, secret) {
//     if (!bufferOrString(secret)) {
//       throw Error('Invalid secret was provided.');
//     }
//     v = normalizeInput(v);
//     const hmac = crypto.createHmac('sha' + bits, secret);
//     const sig = (hmac.update(v), hmac.digest('base64'));


//     console.log('SIG:', sig);


//     // return base64url.fromBase64(sig);
//   }
// }

// function createVerifier(bits) {
//   const signer = createSigner(bits);
//   return function (v, signature, secret) {
//     // return bufferEqual(Buffer(signature), Buffer(signer.call(this, v, secret)));
//   }
// }


// var
// bits   = 256,
// secret = 'abc1235',
// sign   = createSigner(bits),
// verify = createVerifier(bits);


// var
// signed = sign({ some: 'other data' }, secret);

// console.log('signed:', signed);





exports.encode = function (data, expires, issuedAt) {
};

exports.verify = function (token) {
};

exports.decode = function (token) {
};