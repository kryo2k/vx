'use strict';

var
express = require('express'),
controller = require('./user.ctrl'),
auth = require('../../middleware/authentication');

var
router = express.Router();

router.get('/profile',          auth(), controller.profile);
router.post('/profile',         auth(), controller.updateProfile);
router.post('/change-password', auth(), controller.changePassword);
router.post('/signup', controller.signup);
router.post('/login',  controller.login);

module.exports = router;