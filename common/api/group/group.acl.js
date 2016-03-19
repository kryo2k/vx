var
groupAcl = require('../../middleware/group-acl-access');

exports.r = groupAcl({
  require: 'read'
});

exports.rw = groupAcl({
  require: ['read','write']
});

exports.rwd = groupAcl({
  require: ['read','write','delete']
});