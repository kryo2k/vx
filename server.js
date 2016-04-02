'use strict';

var
mongoose = require('mongoose'),
config = require('./config'),
log = require('./common/components/log'),
serverFactory = require('./server/index');

var
comp = process.argv[2],
server = serverFactory(comp);

if(!server) {
  log.error('Unable to load the requested server component (%s)', comp);
  return;
}

// connect to mongo server
mongoose.connect(config.database.uri, config.database.options);

// boostrap this server
server();
