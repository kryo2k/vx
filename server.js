'use strict';

var
express = require('express'),
mongoose = require('mongoose'),
http = require('http'),
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
expressReqId = require('express-request-id'),
config = require('./config'),
log = require('./common/components/log'),
requestLogger = require('./common/middleware/request-log'),
responseHandler = require('./common/middleware/response-handler'),
userNotification = require('./common/middleware/user-notification'),
errorHandler = require('./common/middleware/error-handler'),
serverFactory = require('./server/index');

// console.log('config:', config);

var
app = express(),
port = config.server.port,
addr = config.server.address,
comp = config.server.component,
server = serverFactory(comp);

if(!server) {
  log.error('Unable to load the requested server component (%s)', comp);
  return;
}

// connect to mongo server
mongoose.connect(config.database.uri, config.database.options);

app // add some basic middleware to app
.use(expressReqId())
.use(bodyParser.json())
.use(cookieParser())
.use(userNotification())
.use(requestLogger())
.use(responseHandler())
.use(express.static('static'));

// boostrap this server with app
server(app);

// serve 404s from these directories only
app.route('/:url(api|app|vendor|assets)/*')
.get(function (req, res) {
  res.sendStatus(404);
});

// catch all else to index html page
app.route('/*') .get(function (req, res) {
  res.sendfile('static/index.html');
});

// handle errors with middleware
app.use(errorHandler());

http
// create a new server
.createServer(app)
// start up the server
.listen(port, addr, function () {
  log.info('%s server listening on %s:%d in %s mode', app.get('server-name'), addr, port, app.get('env'));
});