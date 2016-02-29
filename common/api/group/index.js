'use strict';

var
express = require('express'),
controller = require('./group.ctrl'),
auth = require('../../middleware/authentication');

var
router = express.Router();

router.get('/',                         auth(), controller.index);
router.get('/:groupId',                 auth(), controller.detail);
router.get('/:groupId/members',         auth(), controller.members);
router.post('/',                        auth(), controller.create);
router.post('/:groupId',                auth(), controller.update);
router.post('/:groupId/add',            auth(), controller.addMember);
router.delete('/:groupId',              auth(), controller.remove);
router.delete('/:groupId/:groupUserId', auth(), controller.removeMember);

module.exports = router;