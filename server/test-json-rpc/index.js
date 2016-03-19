'use strict';

// var
// requestLogger = require('../../common/middleware/request-log');

//
// Bootstrap for Test RPC server
//

module.exports = function (app) {
  app.set('server-name', 'Test JSON RPC');

  // app.use(requestLogger({
  //   test: true
  // }));

  // install local routes:
  app.use('/hello', require('./api/hello'));
};