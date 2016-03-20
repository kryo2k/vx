'use strict';

var
express = require('express'),
controller = require('./contact.ctrl');

var
router = express.Router();

router.post('/submit', controller.submit);

module.exports = router;
