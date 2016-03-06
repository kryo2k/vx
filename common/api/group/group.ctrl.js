'use strict';

var
format = require('util').format,
ValidationError = require('../../components/error-validation'),
InputError = require('../../components/error-input'),
modelId = require('../../middleware/model-id'),
ModelUser = require('../user/user.model'),
ModelGroup = require('./group.model'),
ModelGroupMember = require('./member/member.model');

// @auth
// @method GET
exports.index = function (req, res, next) {
  ModelGroup.find({ createdBy: req.user }, '_id name', function (err, docs) {
    if(err) {
      return next(err);
    }

    res.respondOk(docs);
  });
};

// @auth
// @method GET
exports.members = function (req, res, next) {
  req.group.allMembers({}, true, false)
    .then(res.respondOk.bind(res))
    .catch(next);
};

// @auth
// @method GET
exports.detail = function (req, res, next) {
  req.group.populate('createdBy', '_id name', function (err) {
    if(err) {
      return next(err);
    }

    var detail = req.group.profileDetail;

    req.group.memberCount(function (err, count) {
      if(err) {
        return next(err);
      }

      detail.memberCount = count;
      res.respondOk(detail);
    });
  });
};

// @auth
// @method GET
exports.count = function (req, res, next) {
  req.group.memberCount(function (err, count) {
    if(err) {
      return next(err);
    }

    res.respondOk(count);
  });
};

// @auth
// @method GET
exports.role = function (req, res, next) {
  req.group.getRoleUser(req.user, function (err, role) {
    if(err) {
      return next(err);
    }
    else if(!role) {
      return next(new InputError('You don\'t have a role on this group.'));
    }

    res.respondOk(role);
  });
};

// @auth
// @method DELETE
exports.remove = function (req, res, next) {

  //
  // TODO: See if user can remove from this group
  //

  // remove all members
  ModelGroupMember.find({ group: req.group }).remove(function (err) {
    if(err) {
      return next(err);
    }

    // remove group document
    req.group.remove(function (err) {
      if(err) {
        return next(err);
      }

      res.respondOk();
    });
  });
};

// @auth
// @method POST
exports.create = function (req, res, next) {
  var
  group = new ModelGroup(req.body);

  // these can't be set publically
  group.createdBy = req.user;
  group.createdOn = new Date();

  group.save(function (err) {
    if(err) {
      return next(new ValidationError(err));
    }

    res.respondOk(group.profile);
  });
};

// @auth
// @method POST
exports.update = function (req, res, next) {

  //
  // TODO: See if user can update this group
  //

  req.group.applyUpdate(req.body).save(function (err) {
    if(err) {
      return next(new ValidationError(err));
    }

    res.respondOk();
  });
};

// @auth
// @method POST
exports.addMember = function () {
  return modelId({
    model: ModelUser,
    param: function (req) { return req.body.user; },
    property: 'addUser',
    select: '_id name'
  }).use(function (req, res, next) {

    if(req.group.createdBy.equals(req.addUser._id)) { // prevent adding creator as member
      if(req.user._id.equals(req.addUser._id)) {
        return next(new InputError('You cant add yourself to your own group.'));
      }

      return next(new InputError('The one who created this group is automatically a member of it.'));
    }

    //
    // TODO: See if user can add member to this group
    //

    req.group.addMember(req.addUser, req.body.role)
      .then(function () { res.respondOk(); })
      .catch(next);

  }).apply(this, arguments);
};

// @auth
// @method DELETE
exports.removeMember = function (req, res, next) {

  //
  // TODO: See if user can remove member from this group
  //

  req.group.removeMember(req.groupUser)
    .then(function () { res.respondOk(); })
    .catch(next);
};