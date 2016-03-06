
'use strict';

var
Q = require('q'),
_ = require('lodash'),
mongoose = require('mongoose'),
Schema = mongoose.Schema,
compare = require('../../components/compare'),
mongoUtil = require('../../components/mongo-util');

var
GroupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  createdOn: {
    type: Date,
    required: true,
    default: Date.now
  }
});

GroupSchema.virtual('profile')
  .get(function () {
    return {
      _id: this._id,
      name: this.name
    };
  });

GroupSchema.virtual('profileDetail')
  .get(function () {
    return this.toObject();
  });


GroupSchema.statics = {
};

GroupSchema.methods = {
  findByIdAuthorized: function (user, id, projection, options, cb) {
    console.log('Using group authorized function');
    return this.findById(id, projection, options, cb);
  },
  applyUpdate: function (data) {
    data = data || {};
    return ['name', 'description'].reduce(function (p, c) {
      if(data.hasOwnProperty(c)) {
        p[c] = data[c];
      }
      return p;
    }, this);
  },

  memberCount: function (cb) {
    var
    promise = new mongoose.Promise(cb);

    this.model('GroupMember')
      .count({ group: this }, function (err, count) {
        if(err) return promise.error(err);
        promise.complete(count);
      });

    return promise;
  },

  getRoleUser: function (user, cb) {
    var
    promise   = new mongoose.Promise(cb),
    userId    = mongoUtil.getObjectId(user);

    if(!userId) { // no user, no role
      promise.complete(false);
      return promise;
    }

    var
    createdBy = mongoUtil.getObjectId(this.createdBy),
    ModelGroupMember = this.model('GroupMember');

    if(createdBy && createdBy.equals(userId)) { // compare createdBy id to user
      promise.complete(ModelGroupMember.CREATOR); // is (a) creator
      return promise;
    }

    ModelGroupMember.findOne({ group: this, user: userId}, '_id role', function (err, groupMem) {
      if(err) {
        return promise.error(err);
      }
      else if(!groupMem) {
        return promise.complete(false); // invalid/non-existent user.
      }

      promise.complete(groupMem.role);
    });

    return promise;
  },

  allMembers: function (criteria, descendingRole, decendingName, cb) {
    var
    promise = new mongoose.Promise(cb),
    GroupMember = this.model('GroupMember'),
    cmp = GroupMember.comparer(descendingRole, decendingName);

    GroupMember
      .find(_.merge({ group: this }, criteria))
      .populate('user', '_id name')
      .exec(function (err, docs) {
        if(err) return promise.error(err);
        promise.complete(docs.sort(cmp));
      });

    return promise;
  },

  addMember: function (user, role, joined, cb) {
    return this.model('GroupMember').addMember(this, user, role, joined, cb);
  },

  removeMember: function (user, cb) {
    return this.model('GroupMember').removeMember(this, user, cb);
  }
};

module.exports = mongoose.model('Group', GroupSchema);
