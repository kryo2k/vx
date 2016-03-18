'use strict';

//
// Bootstrap for Authentication server
//

module.exports = function (app) {
  app.set('server-name', 'Authentication');

  // install local routes:
  app.use('/api/user',  require('../common/api/user'));
  app.use('/api/group', require('../common/api/group'));
};