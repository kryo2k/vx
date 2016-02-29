
var
mongoose = require('mongoose'),
config = require('../config');

// connect to mongo server
var db = mongoose.connect(config.database.uri, config.database.options);


var
User = require('../common/api/user/user.model');

function error(err) {
  if(err) {
    console.error('ERROR:', err.stack||err);
  }

  return err;
}

User.find({}).remove(function (err) {
  if(err) {
    return error(err);
  }

  User.create({
    name: 'Alice',
    email: 'alice@alicesite.com'
  }, {
    name: 'Bob',
    email: 'bob@bobsite.com'
  },{
    name: 'Charlie',
    email: 'charlie@middleman.com'
  }, function (err, d1, d2, d3) {
    if(err) {
      return error(err);
    }

    [d1, d2, d3].forEach(function(user, index){
      console.log('user %s, public key: %j', user._id, user.publicKey.toString('hex'));
    });

    var
    pubAlice   = d1.publicKey,
    pubBob     = d2.publicKey,
    pubCharlie = d3.publicKey;

    var
    aliceMessage = d1.encrypt(pubBob, 'Hello Bob, this is a secure message from Alice.'),
    bobDecoded   = d2.decrypt(pubAlice, aliceMessage),
    bobMessage   = d2.encrypt(pubAlice, 'Hello Alice, this is a secure message from Bob.'),
    aliceDecoded = d1.decrypt(pubBob, bobMessage);

    console.log('------------------------------')
    console.log('Alice message to Bob: %j', aliceMessage);
    console.log('         Bob decoded: %s', bobDecoded);
    console.log('Bob message to Alice: %j', bobMessage);
    console.log('       Alice decoded: %s', aliceDecoded);
    console.log('------------------------------')
    console.log('Charlie intercepted (alice -> bob): %j', d3.decrypt(pubAlice, aliceMessage));
    console.log('Charlie intercepted (bob -> alice): %j', d3.decrypt(pubBob, bobMessage));

    // alice wants to sign a secret for herself only.

    var
    aliceSecret = d1.encrypt(pubAlice, 'The key to the door is under the rock.');

    console.log('------------------------------')
    console.log('Alice secret: %j (%s)', aliceSecret, d1.decrypt(pubAlice, aliceSecret));
    console.log('------------------------------')
    console.log('Charlie intercepted (alice -> alice): %j', d3.decrypt(pubAlice, aliceSecret));

    //
    db.disconnect();
  });
});