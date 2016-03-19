'use strict';

var
express = require('express'),
controller = require('./group.ctrl'),
auth = require('../../middleware/authentication'),
modelId = require('../../middleware/model-id'),
acl = require('./group.acl');

var
router = express.Router(),
groupId = modelId({
  param: 'groupId',
  property: 'group',
  modelName: 'group',
  model: require('./group.model')
});

router.get('/',                         auth(),                                controller.index);
router.get('/:groupId',                 auth(), groupId, acl.r,                controller.detail);
router.get('/:groupId/privileges',      auth(), groupId, acl.r,                controller.privileges);
router.get('/:groupId/count',           auth(), groupId, acl.r,                controller.count);
router.get('/:groupId/role',            auth(), groupId, acl.r,                controller.role);
router.post('/',                        auth(),                                controller.create);
router.post('/:groupId',                auth(), groupId, acl.rw,               controller.update);
router.delete('/:groupId',              auth(), groupId, acl.rwd,              controller.remove);

router.use('/:groupId/member',          auth(), groupId, require('./member'));

module.exports = router;