'use strict';
var
// express = require('express'),
path = require('path'),
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
expressReqId = require('express-request-id'),
requestLogger = require('../common/middleware/request-log'),
responseHandler = require('../common/middleware/response-handler'),
userNotification = require('../common/middleware/user-notification'),
errorHandler = require('../common/middleware/error-handler');

//
// Bootstrap for Authentication server
//

module.exports = function (app) {
  app.set('server-name', 'API');

  app // add some basic middleware to app
  .use(expressReqId())
  .use(bodyParser.json())
  .use(cookieParser())
  // .use(express.static('static'))
  .use(userNotification())
  .use(requestLogger())
  .use(responseHandler());

  // install local routes:
  app.use('/contact', require('../common/api/contact'));
  app.use('/user',    require('../common/api/user'));
  app.use('/group',   require('../common/api/group'));

  // serve 404s from these directories only
  // app.route('/:url(api|app|vendor|assets)/*')
  // .get(function (req, res) {
  //   res.sendStatus(404);
  // });

  // catch all else to index html page
  // app.route('/*') .get(function (req, res) {
  //   res.sendFile(path.join(__dirname, '../static/index.html'));
  // });

  // handle errors with middleware
  app.use(errorHandler());
};
