'use strict';
var
express = require('express'),
http = require('http'),
path = require('path'),
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
expressReqId = require('express-request-id'),
log = require('../common/components/log'),
mailer = require('../common/components/mailer'),
autobahnSvc = require('../common/components/autobahn-service'),
autobahnMw = require('../common/middleware/autobahn'),
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
  argv = process.argv,
  port = argv[3],
  addr = argv[4];

  app.set('server-name', 'API');

  [ // install event listeners for mailer
    'queue-processing-start',
    'queue-before-send',
    'queue-error',
    'queue-after-send',
    'queue-processing-finish',
    'send-success',
    'error',
    'before-send',
    'send-error-noretry',
    'send-error',
    'send-error-retry-failed',
    'send-error-retry',
    'queue-item-add',
    'queue-start',
    'queue-stop'
  ].forEach(function(evt) {
    mailer.on(evt, function () {
      log.info('Mailer (%s) %j', evt, Array.prototype.slice.call(arguments));
    });
  });

  // start queueing email requests
  mailer.queueStart();

  //
  // Connect to wamp
  //

  autobahnSvc.on('open', function (session) {
    log.info('%s server connected to WAMP server.', app.get('server-name'));
  });

  autobahnSvc.init(argv[5], argv[6], argv[7], argv[8]).start();

  app // add some basic middleware to app
  .use(expressReqId())
  .use(bodyParser.json())
  .use(cookieParser())
  .use(autobahnMw())
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
