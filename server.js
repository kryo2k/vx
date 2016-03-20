'use strict';

var
express = require('express'),
mongoose = require('mongoose'),
http = require('http'),
config = require('./config'),
log = require('./common/components/log'),
serverFactory = require('./server/index');

var
app = express(),
port = config.server.port,
addr = config.server.address,
comp = process.argv[2] || config.server.component,
server = serverFactory(comp);

if(!server) {
  log.error('Unable to load the requested server component (%s)', comp);
  return;
}

// connect to mongo server
mongoose.connect(config.database.uri, config.database.options);

// boostrap this server with app
server(app);

http
// create a new server
.createServer(app)
// start up the server
.listen(port, addr, function () {
  log.info('%s server listening on %s:%d in %s mode', app.get('server-name'), addr, port, app.get('env'));
});
