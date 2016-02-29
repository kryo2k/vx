'use strict';

var
express = require('express'),
controller = require('./hello.ctrl');

var
router = express.Router();

router.get('/', controller.index);
router.post('/', controller.post);

module.exports = router;