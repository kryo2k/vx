'use strict';
var
express = require('express'),
http = require('http'),
path = require('path'),
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
expressReqId = require('express-request-id'),
log = require('../common/components/log'),
requestLogger = require('../common/middleware/request-log'),
responseHandler = require('../common/middleware/response-handler'),
userNotification = require('../common/middleware/user-notification'),
errorHandler = require('../common/middleware/error-handler'),
config = require('../config');

//
// Bootstrap for API server
//

module.exports = function () {

  var
  app = express(),
  port = process.argv[3],
  addr = process.argv[4];

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

  // handle errors with middleware
  app.use(errorHandler());

  http
  // create a new server
  .createServer(app)
  // start up the server
  .listen(port, addr, function () {
    log.info('%s server listening on %s:%d in %s mode', app.get('server-name'), addr, port, app.get('env'));
  });
};
