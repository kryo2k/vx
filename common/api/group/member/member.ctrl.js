'use strict';

var
paginateUtil = require('../../../components/paginate-util'),
InputError = require('../../../components/error-input'),
modelId = require('../../../middleware/model-id'),
ModelUser = require('../../user/user.model'),
model = require('./member.model');

// @auth
// @method GET
exports.index = function (req, res, next) {
  model.paginate({ group: req.group }, {
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
// @method POST
exports.add = function () {
  var roleCmp = model.comparerRole(true);

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
exports.remove = function (req, res, next) {
  var roleCmp = model.comparerRole(true);

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