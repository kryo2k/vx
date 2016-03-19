var
_ = require('lodash'),
Q = require('q');

function isKey(v) {
  return /^(string|number|boolean)$/.test(typeof v);
}

function MemoryCache(opts) {
  var
  data = {},
  options = _.merge({
    ttl: 0,
    scope: this
  }, opts);

  Object.defineProperties(this, { // prevent changing references after creation
    data: {
      get : function () { return data; }
    },
    options: {
      get : function () { return options; }
    }
  });
}

MemoryCache.prototype.createRecord = function (expires, value) {
  return [expires, value];
};

MemoryCache.prototype.readRecordValue = function (record, property) {
  if(_.isArray(record)) {
    switch(property) {
      case 'expire': return record[0];
      case 'value':  return record[1];
    }
  }

  return null;
};

MemoryCache.prototype.get = function (key) {
  return this.readRecordValue(this.data[key], 'value');
};

MemoryCache.prototype.set = function (key, value, ttl) {
  if(ttl !== false) {
    ttl = !_.isNumber(ttl) ? this.options.ttl : ttl;
  }

  this.data[key] = this.createRecord(_.isNumber(ttl) ? (Date.now() + ttl) : false, value);

  return this;
};

MemoryCache.prototype.unset = function (key) {
  delete this.data[key];
  return this;
};

MemoryCache.prototype.has = function (key) {
  if(!this.data.hasOwnProperty(key)) {
    return false;
  }

  var exp = this.readRecordValue(this.data[key], 'expire');

  if(exp && (Date.now() > exp)) {
    this.unset(key); // not caught up by garbage collection
    return false;
  }

  return true;
};

MemoryCache.prototype.check = function (key) {
  var
  options = false,
  setterFn = false;

  if(!isKey(key)) {
    return Q.reject(new Error('Invalid key was provided.'));
  }

  if(arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments, 1);
    while((arg = args.shift()) !== undefined) {
      if(_.isFunction(arg) && !setterFn) {
        setterFn = arg;
      }
      else if(_.isObject(arg) && !options) {
        options = arg;
      }

      if(setterFn && options) {
        break;
      }
    }
  }

  options = _.merge({}, this.options, options);

  if(!this.has(key)) {
    if(!setterFn) {
      return Q.when(null);
    }

    // set via setter function (allows promises)
    this.set(key, setterFn.call(options.scope||this), options.ttl);
  }

  return Q.when(this.get(key));
};

exports.Memory = MemoryCache;