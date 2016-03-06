'use strict';

var
express = require('express'),
controller = require('./group.ctrl'),
auth = require('../../middleware/authentication'),
modelId = require('../../middleware/model-id'),
groupAcl = require('../../middleware/group-acl-access');

var
router = express.Router(),
groupId = modelId({
  param: 'groupId',
  property: 'group',
  modelName: 'group',
  model: require('./group.model')
}),
groupUserId = modelId({
  param: 'groupUserId',
  property: 'groupUser',
  modelName: 'group user',
  model: require('./member/member.model')
}),
groupR = groupAcl({
  require: 'read'
}),
groupRW = groupAcl({
  require: ['read','write']
}),
groupRWD = groupAcl({
  require: ['read','write','delete']
});

router.get('/',                         auth(),                                 controller.index);
router.get('/:groupId',                 auth(), groupId, groupR,                controller.detail);
router.get('/:groupId/privileges',      auth(), groupId, groupR,                controller.privileges);
router.get('/:groupId/members',         auth(), groupId, groupR,                controller.members);
router.get('/:groupId/count',           auth(), groupId, groupR,                controller.count);
router.get('/:groupId/role',            auth(), groupId, groupR,                controller.role);
router.post('/',                        auth(),                                 controller.create);
router.post('/:groupId',                auth(), groupId, groupRW,               controller.update);
router.post('/:groupId/add',            auth(), groupId, groupRW,               controller.addMember);
router.delete('/:groupId',              auth(), groupId, groupRWD,              controller.remove);
router.delete('/:groupId/:groupUserId', auth(), groupId, groupUserId, groupRWD, controller.removeMember);

module.exports = router;