
var
mongoose = require('mongoose'),
config = require('../config'),
seeding = require('./seeding');

// connect to mongo server
var db = mongoose.connect(config.database.uri, config.database.options);


var
User = require('../common/api/user/user.model');

function error(err) {
  if(err) {
    console.error('ERROR:', err.stack||err);

    if(err.errors) {
      console.error(err.errors);
    }
  }

  return err;
}

seeding.qFlushModels(User)
.spread(function (rmUser) {
  console.log('flushed: %s users(s)', rmUser);

  var
  pw = 'my incredibly hard password';

  return seeding.qSeedModels([User], [
    [{
      name: 'Alice',
      email: 'alice@alicesite.com',
      password: pw,
      passwordConfirm: pw
    }, {
      name: 'Bob',
      email: 'bob@bobsite.com',
      password: pw,
      passwordConfirm: pw
    },{
      name: 'Charlie',
      email: 'charlie@middleman.com',
      password: pw,
      passwordConfirm: pw
    }]
  ]);
})
.spread(function (users) {
  var
  d1 = users[0],
  d2 = users[1],
  d3 = users[2];

  for(var i = 0; i < 10; i++) {
    console.log('%d): %j', i, d1.tokenSign());
  }


  // var
  // d1token = d1.tokenSign(Date.now() + 8.64e7);

  // console.log('d1 TOKEN:  %j', d1token);
  // console.log('d1 VALID:  %j', d1.tokenVerify(d1token));
  // console.log('d1 REMAIN: %s', d1.tokenRemainingMs(d1token));

  return User.authenticate('alice@alicesite.com', 'my incredibly hard password')
    .then(function (token) {

      if(!token) {
        console.log('invalid user/password..');
        return;
      }

      console.log('token:', token);
      return User.findUserByToken(token)
        .then(function (user) {
          console.log('user:', user);

          if(user) {
            console.log('user time remaining:', user.tokenRemainingMs(token));
          }
        });;
    });

  // return User.findUserByToken(d1token)
  //   .then(function (user) {
  //     console.log('user:', user);
  //   });

  // console.log('Alice Password:',   d1.password);
  // console.log('Bob Password:',     d2.password);
  // console.log('Charlie Password:', d3.password);

  [d1, d2, d3].forEach(function(user, index){
    console.log('user %s, public key: %j', user._id, user.publicKey.toString('hex'));
  });

  var
  pubAlice   = d1.publicKey,
  pubBob     = d2.publicKey,
  pubCharlie = d3.publicKey;

  var // sign to other user testing
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

  var // self signed secret testing
  aliceSecret   = d1.encrypt(pubAlice,   'The key to the door is under the rock.'),
  bobSecret     = d2.encrypt(pubBob,     'Lost 250,000 in vegas, dont tell wife.'),
  charlieSecret = d3.encrypt(pubCharlie, 'Magical powers can be obtained by eating mangos.');

  console.log('------------------------------')
  console.log('  Alice secret: %j (%s)', aliceSecret,   d1.decrypt(pubAlice,   aliceSecret));
  console.log('    Bob secret: %j (%s)', bobSecret,     d2.decrypt(pubBob,     bobSecret));
  console.log('Charlie secret: %j (%s)', charlieSecret, d3.decrypt(pubCharlie, charlieSecret));
  console.log('------------------------------')
  console.log('Charlie intercepted (alice -> alice): %j', d3.decrypt(pubAlice, aliceSecret));
  console.log('Charlie intercepted     (bob -> bob): %j', d3.decrypt(pubBob,   bobSecret));

  return users;
})
.catch(error)
.finally(function () {
  db.disconnect();
});