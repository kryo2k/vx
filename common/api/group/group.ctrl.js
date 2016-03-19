'use strict';

var
format = require('util').format,
ValidationError = require('../../components/error-validation'),
paginateUtil = require('../../components/paginate-util'),
InputError = require('../../components/error-input'),
modelId = require('../../middleware/model-id'),
ModelUser = require('../user/user.model'),
ModelGroup = require('./group.model'),
ModelGroupMember = require('./member/member.model');

// @auth
// @method GET
exports.index = function (req, res, next) {
  ModelGroup.allGroupIDsByUser(req.user, function (err, ids) {
    if(err) {
      return next(err);
    }

    ModelGroup.paginate({ _id: { $in: ids } }, {
      select: '_id name',
      sort: { name: 1 },
      page: paginateUtil.page(req.query),
      limit: paginateUtil.offset(req.query)
    }, function (err, docs) {
      if(err) {
        return next(err);
      }

      res.respondOk(docs);
    });
  });
};

// @auth
// @method GET
exports.members = function (req, res, next) {
  ModelGroupMember.paginate({ group: req.group }, {
    select: '_id user joined role',
    sort: { 'joined': 1 },
    populate: {
      path: 'user',
      select: '_id name'
    },
    page: paginateUtil.page(req.query),
    limit: paginateUtil.offset(req.query)
  }, function (err, docs) {
    if(err) {
      return next(err);
    }

    res.respondOk(docs);
  });
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

    res.respondOk({ role: role, isCreator: req.userIsGroupCreator });
  });
};

// @auth
// @method GET
exports.privileges = function (req, res, next) {
  req.group.getPrivilegesUser(req.user, function (err, priv) {
    if(err) {
      return next(err);
    }

    res.respondOk(priv);
  });
};

// @auth
// @method DELETE
exports.remove = function (req, res, next) {

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

  // setup acl access
  group.initAclAccess(req.user);

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
  var roleCmp = ModelGroupMember.comparerRole(true);

  return modelId({
    model: ModelUser,
    modelName: 'user',
    param: function (req) { return req.body.user; },
    property: 'addUser',
    select: '_id name'
  })
  .use(function (req, res, next) {

    if(req.group.createdBy.equals(req.addUser._id)) { // prevent adding creator as member
      if(req.user._id.equals(req.addUser._id)) {
        return next(new InputError('You cant add yourself to your own group.'));
      }

      return next(new InputError('The one who created this group is automatically a member of it.'));
    }
    else if(roleCmp(req.userGroupRole, req.body.role) === 1) {
      return next(new InputError('You are not allowed to add a member with a higher role than you have.'));
    }

    req.group.addMember(req.addUser, req.body.role)
      .then(function (groupMember) {
        res.respondOk();
      })
      .catch(next);

  })
  .apply(this, arguments);
};

// @auth
// @method DELETE
exports.removeMember = function (req, res, next) {
  var roleCmp = ModelGroupMember.comparerRole(true);

  if(!req.groupUser.group.equals(req.group._id)) {
    return next(new InputError('User does not belong to this group.'));
  }
  else if(roleCmp(req.userGroupRole, req.groupUser.role) >= 0 && !req.userIsGroupCreator) {
    return next(new InputError('You are not allowed to remove a member with an equal or higher role than you have.'));
  }

  req.group.removeMember(req.groupUser)
    .then(function () { res.respondOk(); })
    .catch(next);
};