var
Q = require('q'),
_ = require('lodash'),
mongoose = require('mongoose'),
config = require('../config'),
UserSessionManager = require('../common/api/user/session-manager');

module.exports = {
  createClass: function (test) {
    var obj = new UserSessionManager();
    test.equals(obj instanceof UserSessionManager, true, 'Object is not an instance of UserSessionManager');
    test.done();
  },
  addUserSession: function (test) {

    var
    obj = new UserSessionManager();

    test.equals(obj.countUsers, 0, 'Initial user count was not zero.');
    test.equals(obj.countSessions, 0, 'Initial session count was not zero.');

    obj.add(1, 1);

    test.equals(obj.countUsers, 1, 'User count should be 1.');
    test.equals(obj.countSessions, 1, 'Session count should be 1.');

    obj.add(1, 1); // duplicate check
    obj.add(1, 1);
    obj.add(1, 1);
    obj.add(1, 1);
    obj.add(1, 1);

    test.equals(obj.countUsers, 1, 'User count should be 1.');
    test.equals(obj.countSessions, 1, 'Session count should be 1.');

    obj.add(1, 2);

    test.equals(obj.countUsers, 1, 'User count should be 1.');
    test.equals(obj.countSessions, 2, 'Session count should be 2.');

    obj.add(1, 3);

    test.equals(obj.countUsers, 1, 'User count should be 1.');
    test.equals(obj.countSessions, 3, 'Session count should be 3.');

    obj.add(1, 4);

    test.equals(obj.countUsers, 1, 'User count should be 1.');
    test.equals(obj.countSessions, 4, 'Session count should be 4.');

    obj.add(2, 1);

    test.equals(obj.countUsers, 2, 'User count should be 2.');
    test.equals(obj.countSessions, 5, 'Session count should be 5.');

    obj.add(2, 2);

    test.equals(obj.countUsers, 2, 'User count should be 2.');
    test.equals(obj.countSessions, 6, 'Session count should be 6.');

    obj.add(2, 3);

    test.equals(obj.countUsers, 2, 'Count of users was not 2.');
    test.equals(obj.countSessions, 7, 'Count of sessions was not 7.');

    test.done();
  },

  removeUserSession: function (test) {

    var
    obj = new UserSessionManager();

    obj.add(1, 1);
    obj.add(1, 2);
    obj.add(1, 3);
    obj.add(2, 4);
    obj.add(2, 5);
    obj.add(2, 6);

    test.equals(obj.countUsers, 2, 'User count should be 2.');
    test.equals(obj.countSessions, 6, 'Session count should be 6.');

    // remove non-existent:
    obj.remove(1, 4);
    obj.remove(2, 1);
    obj.remove(5, 9);
    obj.remove(232, 2323);
    test.equals(obj.countUsers, 2, 'User count should be 2.');
    test.equals(obj.countSessions, 6, 'Session count should be 6.');

    //
    obj.remove(1, 3);
    test.equals(obj.countUsers, 2, 'User count should be 2.');
    test.equals(obj.countSessions, 5, 'Session count should be 5.');

    obj.remove(1, 2);
    test.equals(obj.countUsers, 2, 'User count should be 2.');
    test.equals(obj.countSessions, 4, 'Session count should be 4.');

    obj.remove(1, 1);
    test.equals(obj.countUsers, 1, 'User count should be 1.');
    test.equals(obj.countSessions, 3, 'Session count should be 3.');

    obj.remove(2, 4);
    test.equals(obj.countUsers, 1, 'User count should be 1.');
    test.equals(obj.countSessions, 2, 'Session count should be 2.');

    obj.remove(2, 5);
    test.equals(obj.countUsers, 1, 'User count should be 1.');
    test.equals(obj.countSessions, 1, 'Session count should be 1.');

    obj.remove(2, 6);
    test.equals(obj.countUsers, 0, 'User count should be 0.');
    test.equals(obj.countSessions, 0, 'Session count should be 0.');

    test.done();
  },
  queryTesting: function (test) {

    var
    obj = new UserSessionManager();

    obj.add(1, 1);
    obj.add(1, 2);
    obj.add(1, 3);
    obj.add(2, 4);
    obj.add(2, 5);
    obj.add(2, 6);
    obj.add(3, 7);
    obj.add(3, 8);
    obj.add(3, 9);

    console.log('querying on:', obj.toString(true));

    test.equals(obj.users(1).length, 3, 'User 1 count should be 3.');
    test.equals(obj.users(2).length, 3, 'User 2 count should be 3.');
    test.equals(obj.users(3).length, 3, 'User 3 count should be 3.');
    test.equals(obj.users(4), false, 'User 4 count should be FALSE.');

    test.equals(obj.sessions(1).length, 1, 'Session 1 should be 1');
    test.equals(obj.sessions(2).length, 1, 'Session 2 should be 1');
    test.equals(obj.sessions(3).length, 1, 'Session 3 should be 1');
    test.equals(obj.sessions(4).length, 1, 'Session 4 should be 1');
    test.equals(obj.sessions(5).length, 1, 'Session 5 should be 1');
    test.equals(obj.sessions(6).length, 1, 'Session 6 should be 1');
    test.equals(obj.sessions(7).length, 1, 'Session 7 should be 1');
    test.equals(obj.sessions(8).length, 1, 'Session 8 should be 1');
    test.equals(obj.sessions(9).length, 1, 'Session 9 should be 1');
    test.equals(obj.sessions(10), false, 'Session 10 should be FALSE.');

    test.done();
  }
};
