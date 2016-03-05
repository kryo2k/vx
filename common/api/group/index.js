'use strict';

var
express = require('express'),
controller = require('./group.ctrl'),
auth = require('../../middleware/authentication'),
modelId = require('../../middleware/model-id');

var
router = express.Router(),
groupId = modelId({
  param: 'groupId',
  property: 'group',
  modelName: 'group',
  model: require('./group.model')
});

router.get('/',                         auth(),          controller.index);
router.get('/:groupId',                 auth(), groupId, controller.detail);
router.get('/:groupId/members',         auth(), groupId, controller.members);
router.get('/:groupId/count',           auth(), groupId, controller.count);
router.post('/',                        auth(),          controller.create);
router.post('/:groupId',                auth(), groupId, controller.update);
router.post('/:groupId/add',            auth(), groupId, controller.addMember);
router.delete('/:groupId',              auth(), groupId, controller.remove);
router.delete('/:groupId/:groupUserId', auth(), groupId, controller.removeMember);

module.exports = router;