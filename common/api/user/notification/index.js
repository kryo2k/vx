'use strict';

var
express = require('express'),
controller = require('./notification.ctrl');

var
router = express.Router();

router.get('/',      controller.notifications);
router.get('/count', controller.notificationCount);

module.exports = router;