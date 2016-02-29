
'use strict';

var
mongoose = require('mongoose'),
Schema = mongoose.Schema,
compare = require('../../components/compare');

var
ROLE_CREATOR = 'creator',
ROLE_MANAGER = 'manager',
ROLE_MEMBER  = 'member',
ROLES_ALL    = [ROLE_MEMBER, ROLE_MANAGER, ROLE_CREATOR];

var
GroupSchema = new Schema({
  name: String,
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
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      require: true
    },
    role: {
      type: String,
      required: true
      enum: ROLES_ALL,
      default: ROLE_MEMBER
    },
    joined: {
      type: Date,
      required: true,
      default: Date.now
    }
  }]
});

GroupSchema.statics = {
  roleComparer: function (reverse) {
    return compare.number(!reverse, ROLES_ALL.indexOf.bind(ROLES_ALL));
  },
  roleCompare: function (a, b) {
    return this.roleComparer().call(compare, a, b);
  }
};

GroupSchema.methods = {
  addMember: function (member, cb) {
    var promise = new mongoose.Promise(cb);
    promise.error(new Error('coming soon'));
    return promise;
  },
  removeMember: function (memberId, cb) {
    var promise = new mongoose.Promise(cb);
    promise.error(new Error('coming soon'));
    return promise;
  }
};

module.exports = mongoose.model('Group', GroupSchema);
