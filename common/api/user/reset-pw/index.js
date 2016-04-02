'use strict';

var
express = require('express'),
controller = require('./reset-pw.ctrl');

var
router = express.Router();

router.post('/', controller.submit);
router.post('/:id', controller.changePassword);
router.get('/:uniqueId', controller.validate);

module.exports = router;
