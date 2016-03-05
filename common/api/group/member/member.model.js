
'use strict';

var
Q = require('q'),
_ = require('lodash'),
mongoose = require('mongoose'),
Schema = mongoose.Schema,
compare = require('../../../components/compare'),
mongoUtil = require('../../../components/mongo-util');

var
ROLE_CREATOR = 'creator',
ROLE_MANAGER = 'manager',
ROLE_MEMBER  = 'member',
ROLES_ALL    = [ROLE_MEMBER, ROLE_MANAGER, ROLE_CREATOR];

var
GroupMemberSchema = new Schema({
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    require: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  role: {
    type: String,
    required: true,
    enum: ROLES_ALL,
    default: ROLE_MEMBER
  },
  joined: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// enfore unique group:user
GroupMemberSchema.index({ group: 1, user: 1 }, { unique: true });

GroupMemberSchema.statics = {
  CREATOR: ROLE_CREATOR,
  MANAGER: ROLE_MANAGER,
  MEMBER: ROLE_MEMBER,

  comparer: function (descendingRole, decendingName) {
    return compare.multiCompare([
      compare.enum(descendingRole, ROLES_ALL, function (o) { // sort by role order
        return o.role;
      }),
      compare.string(decendingName, function (o) { // sort by name order
        if(!o.user || !o.user.name) return null;
        return o.user.name;
      })
    ]);
  },

  addMember: function (group, user, role, joined, cb) {
    var
    promise = new mongoose.Promise(cb),
    groupId = mongoUtil.getObjectId(group),
    userId = mongoUtil.getObjectId(user),
    spec = { group: groupId, user: userId };

    this.update(
    spec,
    { $setOnInsert: { group: groupId, user: userId, role: role||ROLE_MEMBER, joined: joined||Date.now() } },
    { upsert: true },
    (function(err, result) {
      if(err) return promise.error(err);

      var
      query = !!result.upserted
        ? this.findById(result.upserted[result.n - 1]._id)
        : this.findOne(spec);

      query.exec(function (err, doc) {
        if(err) return promise.error(err);
        promise.complete(doc);
      });
    }).bind(this));

    return promise;
  },

  removeMember: function (group, user, cb) {
    var
    promise = new mongoose.Promise(cb);

    this.remove({
      group: group,
      user: user
    }, function (err, result) {
      if(err) return promise.error(err);
      promise.complete(result);
    });

    return promise;
  }
};

GroupMemberSchema.methods = {
};

module.exports = mongoose.model('GroupMember', GroupMemberSchema);
