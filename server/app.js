'use strict';

//
// Bootstrap for Authentication server
//

module.exports = function (app) {
  app.set('server-name', 'Authentication');

  // install local routes:
  app.use('/user',  require('../common/api/user'));
  app.use('/group', require('../common/api/group'));
};