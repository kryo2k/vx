
'use strict';

var
Q = require('q'),
_ = require('lodash'),
format = require('util').format,
mongoose = require('mongoose'),
Schema = mongoose.Schema,
InputError = require('../../../components/error-input'),
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

GroupMemberSchema.virtual('profile')
  .get(function () {
    return {
      _id: this._id,
      user: this.user,
      joined: this.joined,
      role: this.role
    };
  });

GroupMemberSchema.statics = {
  CREATOR: ROLE_CREATOR,
  MANAGER: ROLE_MANAGER,
  MEMBER: ROLE_MEMBER,

  validateRole: function (role) {
    return ROLES_ALL.indexOf(role) !== -1;
  },
  comparerRole: function (descending, identity) {
    return compare.enum(descending, ROLES_ALL, identity);
  },
  comparer: function (descendingRole, decendingName) {
    return compare.multiCompare([
      this.comparerRole(descendingRole, function (o) {
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

    role = role || ROLE_MEMBER;

    if(!this.validateRole(role)) {
      promise.error(new InputError(format('Role supplied (%s) is invalid.', role)));
      return promise;
    }

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

  removeMember: function (group, member, cb) {
    var
    promise = new mongoose.Promise(cb);

    this.remove({
      _id: member,
      group: group
    }, function (err, result) {
      if(err) return promise.error(err);
      promise.complete(result);
    });

    return promise;
  }
};

GroupMemberSchema.methods = {
};

GroupMemberSchema.plugin(require('mongoose-acl').subject, {
  key: function () {
    return this.role;
  }
});
GroupMemberSchema.plugin(require('mongoose-paginate'));

module.exports = mongoose.model('GroupMember', GroupMemberSchema);
