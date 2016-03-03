'use strict';

var
express = require('express'),
controller = require('./group.ctrl'),
auth = require('../../../middleware/authentication');

var
router = express.Router();

module.exports = router;