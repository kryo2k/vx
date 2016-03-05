
var
Q = require('q'),
mongoose = require('mongoose'),
config = require('../config'),
seeding = require('./seeding'),
mongoUtil = require('../common/components/mongo-util');

var // connect to mongo server
db = mongoose.connect(config.database.uri, config.database.options);

var
User        = require('../common/api/user/user.model'),
Group       = require('../common/api/group/group.model'),
GroupMember = require('../common/api/group/member/member.model');

function error(err) {
  if(err) {
    console.error('ERROR:', err.stack||err);

    if(err.errors) {
      console.error(err.errors);
    }
  }

  return err;
}

seeding.qFlushModels(User, Group, GroupMember)
.spread(function (rmUser, rmGroup, rmGroupMem) {
  console.log('flushed: %s users(s) %s groups(s) %s group members(s)', rmUser, rmGroup, rmGroupMem);

  var pw = 'my incredibly hard password';

  return seeding.qSeedModels([User], [
    [
      {
        name: 'Alice',
        email: 'alice@alicesite.com',
        password: pw,
        passwordConfirm: pw
      }, {
        name: 'Bob',
        email: 'bob@bobsite.com',
        password: pw,
        passwordConfirm: pw
      }, {
        name: 'Charlie',
        email: 'charlie@mafia.com',
        password: pw,
        passwordConfirm: pw
      }, {
        name: 'David',
        email: 'david@charlie.com',
        password: pw,
        passwordConfirm: pw
      }, {
        name: 'Edward',
        email: 'edward@eddysite.com',
        password: pw,
        passwordConfirm: pw
      }
    ]
  ]);
})
.spread(function (users) {
  var
  now = Date.now();

  return seeding.qSeedModels([Group], [
    [
      {
        name:        'Test Group 1',
        description: 'This is a test group, created by seeding.',
        createdBy:   mongoUtil.getObjectId(users[0]),
        createdOn:   now
      },
      {
        name:        'Test Group 2',
        description: 'This is a test group, created by seeding.',
        createdBy:   mongoUtil.getObjectId(users[1]),
        createdOn:   now
      }
    ]
  ])
  .spread(function (groups) {
    return [users, groups];
  });
})
.spread(function(users, groups) { // seed group members

  var
  now = Date.now(),
  u1 = mongoUtil.getObjectId(users[0]),
  u2 = mongoUtil.getObjectId(users[1]),
  u3 = mongoUtil.getObjectId(users[2]),
  u4 = mongoUtil.getObjectId(users[3]),
  u5 = mongoUtil.getObjectId(users[4]),
  groupify = function (group) {
    return function (members) {
      var o = group.toObject();
      o.members = members;
      return o;
    };
  };

  return Q.all([ // seed some users in the groups
    groups[0].addMember(u1, GroupMember.CREATOR, now),
    groups[0].addMember(u2, GroupMember.MANAGER, now),
    groups[0].addMember(u3, GroupMember.MANAGER, now),
    groups[0].addMember(u4, GroupMember.MEMBER, now),
    groups[0].addMember(u5, GroupMember.MEMBER, now),
    groups[1].addMember(u1, GroupMember.CREATOR, now),
    groups[1].addMember(u2, GroupMember.CREATOR, now),
    groups[1].addMember(u3, GroupMember.MANAGER, now),
    groups[1].addMember(u4, GroupMember.MANAGER, now),
    groups[1].addMember(u5, GroupMember.MEMBER, now)
  ])
  .then(function () {
    return Q.all([
      groups[0].allMembers({}, true).then(groupify(groups[0])),
      groups[0].memberCount(),
      groups[1].allMembers({}, true).then(groupify(groups[1])),
      groups[1].memberCount()
    ]);
  });
})
.spread(function (g1, g1mc, g2, g2mc) {
  console.log([[g1,g1mc], [g2,g2mc]].map(function(g){
    return g[0].name + ' | ' + g[0].description + ' ('+g[1]+')' + '\n' + g[0].members.map(function(m){
      return m.user.name + ' (' + m.role + ')';
    }).join(', ');
  }).join('\n'));
})
.catch(error)
.finally(function(){
  db.disconnect();
});