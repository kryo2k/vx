var
_ = require('lodash');

function splitPath(path, delimiter) {
  if(_.isString(path)) {
    return path.split(delimiter||'.');
  }
  if(_.isArray(path)) {
    var rx = /string|number|boolean/;
    return path.filter(function (v) { return rx.test(typeof v); });
  }
  return false;
}

function deepHas(obj, path) {
  path = splitPath(path);

  var key, ns = obj;

  while(path && _.isObject(ns) && (key = path.shift()) !== undefined) {
    if(ns.hasOwnProperty(key)) {
      ns = ns[key];
    }
    else return false;
  }

  return true;
}

function deepGet(obj, path, defaultValue) {
  path = splitPath(path);

  var key, ns = obj;

  while(path && _.isObject(ns) && (key = path.shift()) !== undefined) {
    if(ns.hasOwnProperty(key)) {
      ns = ns[key];
    }
    else {
      ns = defaultValue;
      break;
    }
  }

  return path.length > 0 ? defaultValue : ns;
}

function deepSet(obj, path, value, createMissing) {
  createMissing = (createMissing === undefined) ? true : !!createMissing;
  path = splitPath(path);

  var key, ns = obj;

  while(path && _.isObject(ns) && (key = path.shift()) !== undefined) {
    var
    plen = path.length,
    hOwn = ns.hasOwnProperty(key);

    if(plen > 0 && hOwn) {
      ns = ns[key];
      continue;
    }

    if(!hOwn) {

      //
      // create a new array element
      //
      // ex: { data: [{}, ... ] }
      // deepSet(ex, 'data.$', {}); // should push {} to array
      //
      if(_.isArray(ns)) {
        if(key === '$'||createMissing) {
          if(plen > 0 && !createMissing) {
            break;
          }

          ns.push(plen > 0 ? {} : value);

          if(plen > 0) {
            ns = ns[ns.length - 1];
          }

          continue;
        }
        else break;
      }

      //
      // create a new object element
      //
      // ex: {}
      // deepSet(ex, '1.2.3.4', true) // ex = { 1: { 2: { 3: { 4: true } } } }
      // deepSet(ex, '1.$.2.3', true) // ex = { 1: [ { 2: { 3: true } } ] }
      //
      if(plen > 0) {
        if(createMissing) {
          ns = ns[key] = (path[0] === '$') ? [] : {};
          continue;
        }
        else break;
      }
    }

    ns[key] = value;
  }

  return path.length === 0;
}

function dotify(obj, recurse) {
  recurse = _.isArray(recurse)?recurse:[];

  var result  = {};

  if(_.isObject(obj)) { // includes arrays!

    var
    keys = Object.keys(obj),
    key, val;

    while((key = keys.shift()) !== undefined) {
      val = obj[key];

      if(_.isObject(val)) {
        if(recurse.indexOf(val) > -1) { // prevent recursive dotify
          continue;
        }

        var rdot = dotify(val, recurse);

        Object.keys(rdot).reduce(function (p, c) {
          p[key + '.' + c] = rdot[c];
          return p;
        }, result);

        recurse.push(val);
      }
      else if(!_.isFunction(val)) { // include anything but functions
        result[key] = val;
      }
    }
  }

  return result;
}

module.exports = {
  has: deepHas,
  get: deepGet,
  set: deepSet,
  dotify: dotify
};
