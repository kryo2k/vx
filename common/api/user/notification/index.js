'use strict';

var
express = require('express'),
controller = require('./notification.ctrl');

var
router = express.Router();

router.get('/',           controller.notifications);
router.post('/mark-read', controller.markRead);
router.get('/count',      controller.count);

module.exports = router;