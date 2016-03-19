
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
    var profile = this.toObject();

    delete profile._acl;
    delete profile.__v;

    return profile;
  });


GroupSchema.statics = {
  getRoleACLKey: function (role) {
    if(!role) return 'role:guest';
    return 'role:' + role;
  },
  allGroupIDsByUser: function (user, cb) {
    var
    self = this,
    Member = self.model('GroupMember'),
    promise = new mongoose.Promise(cb);

    var
    chain = Q([]),
    pushRecordId = function (pushTo, property) {
      return function (record) {
        var
        id = mongoUtil.getObjectId(record[property]),
        idSTR;

        if(!id) {
          return pushTo;
        }

        idSTR = id.toString();

        if(pushTo.indexOf(idSTR) === -1) { // only push unique ids
          pushTo.push(idSTR);
        }

        return pushTo;
      };
    };

    // find all group ids user created
    chain = chain.then(function (out) {
      return Q.nfcall(self.find.bind(self), { createdBy: user }, '_id')
        .then(function (groupsCreated) {
          groupsCreated.forEach(pushRecordId(out, '_id'));
          return out;
        });
    });

    // find all group ids user belongs to:
    chain = chain.then(function (out) {
      return Q.nfcall(Member.find.bind(Member), { user: user }, 'group')
        .then(function (groupsParticipating) {
          groupsParticipating.forEach(pushRecordId(out, 'group'));
          return out;
        });
    });

    // resolve the initial promise when ready
    chain = chain
      .then(promise.complete.bind(promise))
      .catch(promise.error.bind(promise));

    return promise;
  }
};

GroupSchema.methods = {
  initAclAccess: function (creatorSubject) {
    var
    Member = this.model('GroupMember'),
    roleKey = this.constructor.getRoleACLKey;

    // grant all privileges on this group to creatorSubject
    creatorSubject.setAccess(this, ['read','write','delete']);

    // grant acl access based on role
    this.setAccess(roleKey(Member.CREATOR), ['read','write','delete']);
    this.setAccess(roleKey(Member.MANAGER), ['read','write']);
    this.setAccess(roleKey(Member.MEMBER),  ['read']);

    return this;
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

    ModelGroupMember.findOne({ group: this, user: userId }, '_id role', function (err, groupMem) {
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

  getPrivilegesUser: function (user, cb) {

    var
    promise = new mongoose.Promise(cb),
    getAccess = this.getAccess.bind(this),
    roleKey = this.constructor.getRoleACLKey.bind(this.constructor);

    this.getRoleUser(user, function (err, role) {
      if(err) {
        return promise.error(err);
      }

      promise.complete(getAccess(roleKey(role)));
    });

    return promise;
  },

  addMember: function (user, role, joined, cb) {
    return this.model('GroupMember').addMember(this, user, role, joined, cb);
  },

  removeMember: function (member, cb) {
    return this.model('GroupMember').removeMember(this, member, cb);
  }
};

GroupSchema.plugin(require('mongoose-acl').object);
GroupSchema.plugin(require('mongoose-paginate'));

module.exports = mongoose.model('Group', GroupSchema);
