'use strict';

var
Q = require('q'),
_ = require('lodash'),
AuthenticationError = require('../../../components/error-authentication'),
InputError          = require('../../../components/error-input'),
ValidationError     = require('../../../components/error-validation'),
mongoUtil           = require('../../../components/mongo-util'),
paginateUtil        = require('../../../components/paginate-util'),
modelUser           = require('../user.model'),
model               = require('./message.model');

function paginateOptions (query, options) {
  options = options || {};
  return _.merge(options, {
    page: paginateUtil.page(query),
    limit: paginateUtil.offset(query)
  });
}

function messageParticipants(user, message) {

  var
  loadUserId = modelUser.findById.bind(modelUser),
  isSender   = mongoUtil.isIdEqual(message.sender,   user),
  isReceiver = mongoUtil.isIdEqual(message.receiver, user);

  if(!message || !_.isObject(message)) {
    return Q.reject(new InputError('Message is not valid.'));
  }

  if(!isSender && !isReceiver) {
    return Q.reject(new InputError('This message does not belong to you.'));
  }

  var
  userKeys = '_id _privateKey';

  return Q.all([ // load up the users involved in this message
    isSender   ? user : Q.nfcall(loadUserId, message.sender,   userKeys),
    isReceiver ? user : Q.nfcall(loadUserId, message.receiver, userKeys)
  ]).spread(function (sender, receiver) {
    if(!sender || !receiver) {
      return Q.reject(new InputError('Unable to load one of the members involved in this message. Aborting.'));
    }

    return {
      isSender: isSender,
      isReceiver: isReceiver,
      sender: sender,
      receiver: receiver
    };
  });
}

// @auth
// @method GET
exports.messagesConvo = function (req, res, next) {

  var
  user = req.user,
  target = req.userTarget,
  options  = paginateOptions (req.query, {
    select: '_id sender receiver unread created',
    sort: { created: -1 }
  });

  return model.paginate({
    $or: [
      { sender: user, receiver: target, removeFromSender:   false },
      { sender: target, receiver: user, removeFromReceiver: false }
    ]
  }, options, function (err, result) {
    if(err) return next(err);

    result.docs = result.docs.map(function (doc) {
      var obj = doc.toObject();
      obj.isSender   = mongoUtil.isIdEqual(obj.sender,   user);
      obj.isReceiver = mongoUtil.isIdEqual(obj.receiver, user);
      // delete obj.sender;
      // delete obj.receiver;
      return obj;
    });

    result.self    = user.profileMinimal;
    result.partner = target.profileMinimal;

    res.respondOk(result);
  });
};

// @auth
// @method GET
exports.messagesFrom = function (req, res, next) {

  var
  options  = paginateOptions (req.query, {
    select: '_id unread created',
    sort: { created: -1 }
  });

  return model.paginate({
    receiver: req.user,
    sender: req.userSender,
    removeFromReceiver: false
  }, options, function (err, result) {
    if(err) return next(err);
    res.respondOk(result);
  });
};

// @auth
// @method GET
exports.messagesTo = function (req, res, next) {

  var
  options  = paginateOptions (req.query, {
    select: '_id unread created',
    sort: { created: -1 }
  });

  return model.paginate({
    sender: req.user,
    receiver: req.userReceiver,
    removeFromSender: false
  }, options, function (err, result) {
    if(err) return next(err);
    res.respondOk(result);
  });
};

// @auth
// @method GET
exports.inbox = function (req, res, next) {
  model.aggregate([
    { $match: { receiver: req.user._id, removeFromReceiver: false } },
    { $group: {
      _id: { sender: '$sender'},
      total: { $sum: 1 },
      unread: { $sum: { $cond: [ { $eq: [ '$unread', true ] }, 1, 0 ] } },
      last: { $max: '$created' },
      first: { $min: '$created' }
    } },
    { $sort: { 'last': -1 } }
  ], function (err, result) {
    if(err) return next(err);

    modelUser.populate(result.map(function (r) {
      r.from = r._id.sender;
      delete r._id;
      return r;
    }), {
      path: 'from',
      select: '_id name'
    }, function (err) {
      if(err) return next(err);
      res.respondOk(result);
    });
  });
};

// @auth
// @method GET
exports.sent = function (req, res, next) {
  model.aggregate([
    { $match: { sender: req.user._id, removeFromSender: false } },
    { $group: {
      _id: { receiver: '$receiver'},
      total: { $sum: 1 },
      unread: { $sum: { $cond: [ { $eq: [ '$unread', true ] }, 1, 0 ] } },
      last: { $max: '$created' }
    } },
    { $sort: { 'last': -1 } }
  ], function (err, result) {
    if(err) return next(err);

    modelUser.populate(result.map(function (r) {
      r.to = r._id.receiver;
      delete r._id;
      return r;
    }), {
      path: 'to',
      select: '_id name'
    }, function (err) {
      if(err) return next(err);
      res.respondOk(result);
    });
  });
};

// @auth
// @method POST
exports.send = function (req, res, next) {

  if(!_.isObject(req.body)) {
    return next(new InputError('Invalid message parameters were provided.'));
  }

  var
  messageBody = req.body.hasOwnProperty('message') ? String(req.body.message) : false;

  if(!messageBody) {
    return next(new InputError('No message body was provided in this message.'));
  }

  var
  message,
  uSend = req.user,
  uRecv = req.userReceiver;

  if(mongoUtil.isIdEqual(uSend, uRecv)) {
    return next(new InputError('You can not send a message to yourself.'));
  }

  message = new model({
    sender: uSend,
    receiver: uRecv,
    message: model.encrypt(messageBody, uSend, uRecv)
  });

  message.save(function (err) {
    if(err) return next(new ValidationError(err));

    // add a notifcation for user that message was sent to them.
    res.userNotify('message', {
      sender: uSend.name,
      senderId: mongoUtil.getObjectId(uSend),
      message: message._id,
      messagePreview: message.preview()
    }, function (err) {
      if(err) return next(new ValidationError(err));
      res.respondOk(message._id);
    }, uRecv);
  });
};

// @auth
// @method GET
exports.read = function (req, res, next) {
  var doc = req.message;
  return messageParticipants(req.user, doc).then(function (result) {

    var
    decrypter,
    publicKey,
    payload = false;

    if(result.isSender) {
      decrypter = result.sender.decrypt.bind(result.sender);
      publicKey = result.receiver.publicKey;
    }
    else {
      decrypter = result.receiver.decrypt.bind(result.receiver);
      publicKey = result.sender.publicKey;
    }

    payload = {
      // attempt to decrypt message
      content: decrypter(publicKey, doc.message),
      sent: doc.created
    };

    if(result.isReceiver && doc.unread) { // mark as read if unread and requesting user is receiver.
      doc.unread = false;

      return Q.nfcall(doc.save.bind(doc)).then(function () { return payload; });
    }

    return payload;
  })
  .then(res.respondOk.bind(res))
  .catch(next);
};

// @auth
// @method DELETE
exports.remove = function (req, res, next) {
  var doc = req.message;
  return messageParticipants(req.user, doc).then(function (result) {
    if(result.isSender) {
      doc.removeFromSender = true;
    }
    else {
      doc.removeFromReceiver = true;
    }

    if(doc.removeFromSender && doc.removeFromReceiver) { // remove permanently
      return Q.nfcall(doc.remove.bind(doc)).then(function () { return; });
    }
    else { // save document with latest changes (if any)
      return Q.nfcall(doc.save.bind(doc)).then(function () { return; });
    }
  })
  .then(res.respondOk.bind(res))
  .catch(next);
};
