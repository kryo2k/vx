'use strict';

var
express = require('express'),
controller = require('./member.ctrl'),
modelId = require('../../../middleware/model-id'),
groupAcl = require('../group.acl');

var
router = express.Router(),
groupUserId = modelId({
  param: 'groupUserId',
  property: 'groupUser',
  modelName: 'group user',
  model: require('./member.model')
});

router.get('/',                groupAcl.r,                controller.index);
router.post('/add',            groupAcl.rw,               controller.add);
router.delete('/:groupUserId', groupAcl.rwd, groupUserId, controller.remove);

module.exports = router;