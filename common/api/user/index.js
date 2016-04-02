'use strict';

var
express = require('express'),
controller = require('./user.ctrl'),
auth = require('../../middleware/authentication');

var
router = express.Router();

router.post('/signup',          controller.signup);
router.post('/login',           controller.login);
router.use('/reset-pw',         require('./reset-pw'));

router.post('/notification-test', auth(), controller.testNotification);

router.get('/profile',          auth(), controller.profile);
router.get('/token-info',       auth(), controller.tokenInfo);
router.get('/token-extend',     auth(), controller.tokenExtend);
router.post('/profile',         auth(), controller.updateProfile);
router.post('/change-password', auth(), controller.changePassword);

router.use('/notification',     auth(), require('./notification'));
router.use('/message',          auth(), require('./message'));

module.exports = router;
