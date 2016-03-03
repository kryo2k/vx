var
_ = require('lodash'),
mongoose = require('mongoose'),
config = require('../config'),
ValidationError = require('../common/components/error-validation'),
ModelUser = require('../common/api/user/user.model');

var
hardPW = 'v4lid@p455Word',
medPW  = 'abc13 98sdj',
easyPW = '123456';

function randomName() {
  return 'Test '+_.sample(['Albert','James','Kim','Elvis','John'])+' '+_.sample(['Emmerson','Jackson','Rogers','Smith','Chin']);
}

function randomEmail(name) {
  return name.toLowerCase().replace(/\s/g,'.')
    + '@' + _.sample(['test-apples.com','test-pears.com','test-hamburgers.com','test-elephants.com','test-figs.com']);
}

module.exports = {
  setUp: function (next) {
    this.db = mongoose.connect(config.database.uri, config.database.options, next);
  },
  tearDown: function (next) {
    this.db.disconnect(next);
  },
  signUpWellFormed: function (test) {

    var
    testName  = randomName(),
    testEmail = randomEmail(testName),
    testPW    = hardPW,
    user = new ModelUser({
      name: testName,
      email: testEmail,
      password: testPW,
      passwordConfirm: testPW
    });

    user.save(function (err) {
      test.ifError(err);
      test.equals(user.name, testName);
      test.equals(user.email, testEmail);
      test.equals(user.password, testPW);

      user.remove(function (err) { // remove user after creating
        test.ifError(err);
        test.done();
      })
    });
  },
  signUpWeakPassword: function (test) {

    var
    name = randomName(),
    user = new ModelUser({
      name: name,
      email: randomEmail(name),
      password: easyPW,
      passwordConfirm: easyPW
    });

    user.save(function (err) {
      test.ok(err instanceof Error, 'Expected a validation error when saved.');

      if(err) {
        test.ok(_.isObject(err.errors) && _.isArray(err.errors.password), 'Expected password error to be defined in error.');
      }

      test.done();
    });
  },
  signUpMissMatchPassword: function (test) {

    var
    name = randomName(),
    user = new ModelUser({
      name: name,
      email: randomEmail(name),
      password: hardPW,
      passwordConfirm: easyPW
    });

    user.save(function (err) {
      test.ok(err instanceof Error, 'Expected a validation error when saved.');

      if(err) {
        test.ok(_.isObject(err.errors) && _.isObject(err.errors.passwordConfirm), 'Expected password confirm error to be defined in error.');
      }

      test.done();
    });
  },
  signUpBadEmail: function (test) {

    var
    name = randomName(),
    user = new ModelUser({
      name: name,
      email: 'joeblow',
      password: hardPW,
      passwordConfirm: hardPW
    });

    user.save(function (err) {
      test.ok(err instanceof Error, 'Expected a validation error when saved.');

      if(err) {
        test.ok(_.isObject(err.errors) && _.isObject(err.errors.email), 'Expected email error to be defined in error.');
      }

      test.done();
    });
  },
  privateKeyCreationWithPassword: function (test) {
    var
    name = randomName(),
    user = new ModelUser({
      name: name,
      email: randomEmail(name),
      password: hardPW,
      passwordConfirm: hardPW
    });

    // expect a private key set (because password was set)
    test.notEqual(user.privateKey, false);

    //
    test.done();
  },
  privateKeyCreationWithoutPassword: function (test) {
    var
    name = randomName(),
    user = new ModelUser({
      name: name,
      email: randomEmail(name)
    });

    // expect new users to not have a private key (till saved, or password is set)
    test.equal(user.privateKey, false);

    // force-create user private key
    user.resetPrivateKey();

    // expect the private key to be set now
    test.notEqual(user.privateKey, false);

    //
    test.done();
  },
  cryptoSignVerifyValidToken: function (test) {
    var
    name = randomName(),
    user = new ModelUser({
      name: name,
      email: randomEmail(name)
    });

    user.resetPrivateKey();

    var token = user.tokenSign(Date.now() + 1000);
    test.ok(!!token, 'Token was not generated');
    test.ok(user.tokenVerify(token), 'Recieved invalid token, when a valid token was expected.');
    test.ok(user.tokenTTL(token) > 950, 'Remaining MS on token is outside threshold.');
    test.done();
  },
  cryptoSignVerifyInvalidToken: function (test) {
    var
    name = randomName(),
    user = new ModelUser({
      name: name,
      email: randomEmail(name)
    });

    user.resetPrivateKey();

    var token = user.tokenSign(Date.now() - 1000);
    test.ok(!!token, 'Token was not generated');
    test.ok(!user.tokenVerify(token), 'Recieved valid token, when an invalid token was expected.');
    test.done();
  }
};