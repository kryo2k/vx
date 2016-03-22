var
autobahnCon = require('./autobahn-connection'),
EventEmitter = require('events');

var
connection = false,
connected = false,
session = false,
proto = new EventEmitter();

Object.defineProperties(proto, {
  connection: {
    get: function () {
      return connection;
    }
  },
  connected: {
    get: function () {
      return connected;
    }
  },
  session: {
    get: function () {
      return session;
    }
  }
});

function connectionCheck() {
  if(!connection) {
    throw new Error('Service has not been initialized.');
  }
}

proto.stop = function () {
  connectionCheck();
  connection.close();
  return proto;
};

proto.start = function () {
  connectionCheck();
  connection.open();
  return proto;
};

proto.init = function (wsUri, realm, authId, secret) {
  connection = autobahnCon.apply(proto, arguments);

  console.log('Autobahn connection (%s) initializing..', wsUri);

  connection.onopen = function (_session, details) {
    connected = true;
    session = _session;
    proto.emit('open', _session, details);
  };

  connection.onclose = function () {
    connected = false;
    session = false;
    proto.emit('close');
  };

  return proto;
};

module.exports = proto;
