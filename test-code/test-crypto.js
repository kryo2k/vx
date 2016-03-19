const
crypto  = require('crypto'),
outAs   = 'base64',
keyAlgo = 'secp256k1',
encAlgo = 'aes-256-ctr';

function newCryptoUser() {
  return crypto.createECDH(keyAlgo);
}

function encrypt(message, secret, inputAs) {
  var cipher = crypto.createCipher(encAlgo, secret);
  return cipher.update(message, inputAs||'utf8', outAs) + cipher.final(outAs);
}

function decrypt(message, secret, inputAs) {
  var decipher = crypto.createDecipher(encAlgo, secret);
  return decipher.update(message, outAs, inputAs) + decipher.final(inputAs);
}

///
// alice and bob want to use cryptography together in a group.
// charlie is another user outside the group.
///

const
alice   = newCryptoUser(),
bob     = newCryptoUser(),
charlie = newCryptoUser();

alice.generateKeys();
// alice.setPrivateKey('2hOBlPD150lUTdmEEbtwe2FdxRpKn5NhEmjczJhbl3M=', outAs);

bob.generateKeys();
// bob.setPrivateKey('R8D9ibo6btim2BSuf5GjMlaA7S2HYgvF/fQ0WAJ6MG4=', outAs);

charlie.generateKeys();
// charlie.setPrivateKey('j/+sGLlCWpqvxvSRVt3YYGnnqypXFvlfgVXs2vXIKAU=', outAs);

const
priAlice   = alice.getPrivateKey(),
pubAlice   = alice.getPublicKey(),
priBob     = bob.getPrivateKey(),
pubBob     = bob.getPublicKey(),
priCharlie = charlie.getPrivateKey(),
pubCharlie = charlie.getPublicKey();

console.log('  alice | pri: %j | pub: %j', priAlice.toString(outAs), pubAlice.toString(outAs));
console.log('    bob | pri: %j | pub: %j', priBob.toString(outAs), pubBob.toString(outAs));
console.log('charlie | pri: %j | pub: %j', priCharlie.toString(outAs), pubCharlie.toString(outAs));

const
secAlice = alice.computeSecret(pubBob),
secBob   = bob.computeSecret(pubAlice);

console.log('alice + bob secret: %j', secAlice.toString(outAs));
console.log('bob + alice secret: %j', secBob.toString(outAs));
console.log('sharing secret: %j', secAlice.equals(secBob));

///
// alice wants to send bob an encrypted message
///

var
aliceMessage = encrypt('Hello Bob, this is a secure message from Alice.', secAlice),
bobDecoded   = decrypt(aliceMessage, secBob),
bobMessage   = encrypt('Hello Alice, this is a secure message from Bob.', secBob),
aliceDecoded = decrypt(bobMessage, secAlice);

console.log('Alice message: %j', aliceMessage);
console.log('  Bob decoded: %j', bobDecoded);
console.log('  Bob message: %j', bobMessage);
console.log('Alice decoded: %j', aliceDecoded);

///
// Charlie wants to man-in-the-middle Alice & Bob.
///

console.log('-----------------');

var
secCharlieAlice = charlie.computeSecret(pubAlice),
secCharlieBob   = charlie.computeSecret(pubBob);

console.log('charlie + alice secret: %j', secCharlieAlice.toString(outAs));
console.log('sharing secret with alice + bob: %j', secCharlieAlice.equals(secAlice));
console.log('charlie + bob secret: %j', secCharlieBob.toString(outAs));
console.log('sharing secret with bob + alice: %j', secCharlieBob.equals(secBob));
console.log('Charlie intercepted (alice -> bob): %j', decrypt(aliceMessage, secCharlieAlice));
console.log('Charlie intercepted (bob -> alice): %j', decrypt(bobMessage, secCharlieBob));