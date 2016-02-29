'use strict';

var
express = require('express'),
controller = require('./user.ctrl'),
auth = require('../../middleware/authentication');

var
router = express.Router();

router.get('/profile', auth(), controller.profile);
router.post('/signup', controller.signup);
router.post('/login',  controller.login);

module.exports = router;