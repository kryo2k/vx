'use strict';

var
express = require('express'),
controller = require('./message.ctrl'),
modelId = require('../../../middleware/model-id');

var
modelMessage = require('./message.model'),
modelUser    = require('../user.model');

var
router = express.Router(),
messageId = modelId({
  param: 'messageId',
  property: 'message',
  modelName: 'message',
  model: modelMessage
}),
userId = modelId({
  param: 'userId',
  property: 'userTarget',
  modelName: 'target user',
  model: modelUser
}),
receiverId = modelId({
  param: 'receiverId',
  property: 'userReceiver',
  modelName: 'receiving user',
  model: modelUser
}),
senderId = modelId({
  param: 'senderId',
  property: 'userSender',
  modelName: 'sending user',
  model: modelUser
});

router.get('/inbox',              controller.inbox);
router.get('/inbox/:senderId',    senderId,   controller.messagesFrom);
router.get('/sent',               controller.sent);
router.get('/sent/:receiverId',   receiverId, controller.messagesTo);
router.get('/convo/:userId',      userId,     controller.messagesConvo);
router.get('/:messageId',         messageId,  controller.read);
router.post('/:receiverId',       receiverId, controller.send);
router.delete('/:messageId',      messageId,  controller.remove);

module.exports = router;