'use strict';
var
path = require('path'),
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
expressReqId = require('express-request-id'),
requestLogger = require('../common/middleware/request-log'),
responseHandler = require('../common/middleware/response-handler'),
userNotification = require('../common/middleware/user-notification'),
errorHandler = require('../common/middleware/error-handler'),
config = require('../config');

//
// Bootstrap for Authentication server
//

var
SOCKET = path.join(__dirname, '../common/socket'),
WAMPCFG = config.wampServer,
SOCKCFG = config.socketServer;

module.exports = function (app) {
  app.set('server-name', 'API');

  app // add some basic middleware to app
  .use(expressReqId())
  .use(bodyParser.json())
  .use(cookieParser())
  .use(userNotification())
  .use(requestLogger())
  .use(responseHandler());

  // install local routes:
  app.use('/contact', require('../common/api/contact'));
  app.use('/user',    require('../common/api/user'));
  app.use('/group',   require('../common/api/group'));

  // install socket providers
  // require(path.join(SOCKET, 'user-notifications')).call(app, WAMPCFG, SOCKCFG.userNotifications);

  // handle errors with middleware
  app.use(errorHandler());
};
