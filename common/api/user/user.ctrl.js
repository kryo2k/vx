'use strict';

var
AuthenticationError = require('../../components/error-authentication'),
InputError          = require('../../components/error-input'),
ValidationError     = require('../../components/error-validation'),
model = require('./user.model');

var
useLongTermToken = true;

// @auth
// @method POST
exports.updateProfile = function (req, res, next) {
  req.user.applyUpdate(req.body).save(function (err) {
    if(err) {
      return next(new ValidationError(err));
    }

    res.userNotify('update-profile', {}, function (err) {
      if(err) return next(err);
      res.respondOk();
    });
  });
};

// @auth
// @method POST
exports.changePassword = function (req, res, next) {

  var
  existingPw = req.user.password,
  data = req.body;

  if(data.oldPassword !== existingPw) {
    return next(new AuthenticationError('Invalid original password. Password change unsuccessful.', { attempted: data.oldPassword }));
  }
  if(!data.newPassword) {
    return next(new InputError('New password was not provided.'));
  }
  if(!data.newPasswordConfirm) {
    return next(new InputError('New password confirmation was not provided.'));
  }

  req.user.password        = data.newPassword;
  req.user.passwordConfirm = data.newPasswordConfirm;

  req.user.save(function (err) {
    if(err) {
      return next(new ValidationError(err));
    }

    res.userNotify('change-password', {}, function (err) {
      if(err) return next(err);
      res.respondOk();
    });
  });
};

// @auth
// @method GET
exports.tokenInfo = function (req, res, next) {
  res.respondOk({
    // info: req.tokenInfo,
    ttl: req.tokenTTL,
    longTerm: req.tokenLongTerm,
    expireDate: req.tokenExpireDate,
    issuedDate: req.tokenIssuedDate
  });
};

// @auth
// @method GET
exports.tokenExtend = function (req, res, next) {
  res.respondOk({ token: model.createToken(req.user, parseInt(req.query.longTerm) === 1) });
};

// @auth
// @method GET
exports.profile = function (req, res, next) {
  res.respondOk(req.user.profile);
};

// @method POST
exports.login = function (req, res, next) {

  var data = req.body;

  model.authenticate(data.username, data.password, data.rememberMe)
    .then(function (token) {
      res.respondOk({ token: token });
    })
    .catch(next);
};

// @method POST
exports.signup = function (req, res, next) {
  var
  user = new model(req.body);
  user.save(function (err) {
    if(err) {
      return next(new ValidationError(err));
    }

    user.addNotification('signup', {}, function (err) {
      if(err) return next(err);

      res.respondOk({ token: model.createToken(user, false) });
    });
  });
};

function findUserSubscriptionSessions(ab, topic, user) {
  return ab.call('wamp.subscription.lookup', [topic, { match: 'exact' }])
    .then(function (subscriptionId) {
      if(!subscriptionId) {
        return [];
      }

      return ab.call('wamp.subscription.list_subscribers', [subscriptionId]);
    })
    .then(function (sessionIds) {
      if(!sessionIds || !sessionIds.length) {
        return [];
      }

      // loop thru session ids and filter the one(s) we're looking for:
      return sessionIds.reduce(function (promise, id) {
        return promise.then(function (result) {
          return ab.call('wamp.session.get', [id])
            .then(function (info) {
              if(!info || info.authrole !== 'user' || !user.tokenVerify(info.authid)) {
                return result;
              }

              result.push(id);

              return result;
            });
        });
      }, Q.when([]));
    });
}

exports.input = function (req, res, next) {
  var
  topic = 'vx.user.notifications',
  data  = req.body;

  req.userSubscriptionSessions(topic)
    .then(function (sessions) {
      var published = sessions.length;

      if(published) {
        res.abPublish(topic, [{ type: 'input', data: data }], { something: 'one' }, {
          eligible: sessions // find all eligible session ids
        });
      }

      res.respondOk({ published: published });
    })
    .catch(next);
};
