var
_ = require('lodash'),
ident = function(v) { return v; };

exports.native = function (descending, identity) {
  var
  asc   = descending ? -1 :  1,
  desc  = descending ?  1 : -1,
  eq    = 0;

  identity = _.isFunction(identity) ? identity : ident;

  return function (a, b) {
    var aV = identity(a), bV = identity(b);

    if(aV > bV) return asc;
    if(aV < bV) return desc;
    return eq;
  };
}

exports.enum = function (descending, enumeration, identity) {
  identity = _.isFunction(identity) ? identity : ident;

  if(!_.isArray(enumeration)) {
    throw new Error('Enumeration must be an array.');
  }

  return exports.native(descending, function (v) {
    return enumeration.indexOf(identity(v));
  });
};

exports.number = function (descending, identity) {
  identity = _.isFunction(identity) ? identity : ident;
  return exports.native(descending, function (v) {
    v = identity(v);

    if(_.isString(v)) {
      v = parseFloat(v);
    }

    return _.isNumber(v) && !isNaN(v) ? v : 0;
  });
};

exports.string = function (descending, identity) {
  identity = _.isFunction(identity) ? identity : ident;
  return exports.native(descending, function (v) {
    v = identity(v);

    if(_.isNumber(v)) { // transform to string
      v = String(v);
    }

    return _.isString(v) ? v : '';
  });
};

exports.stringNoCase = function (descending, useLocale, identity) {
  identity = _.isFunction(identity) ? identity : ident;

  var
  stringFilter = !!useLocale
    ? String.prototype.toLocaleLowerCase
    : String.prototype.toLowerCase;

  return exports.string(descending, function (v) {
    v = identity(v);

    if(/^(number|boolean)$/i.test(typeof v)) {
      v = String(v);
    }

    return _.isString(v) ? stringFilter.call(v) : '';
  });
};

exports.multiCompare = function (sorters) {
  sorters = ((_.isArray(sorters) && sorters.length)
    ? sorters : [exports.string()])
    .filter(_.isFunction);

  if(!sorters.length) { // return save cycle fn
    return function () {
      return 0;
    };
  }

  return function (a, b) {
    var compare = 0;
    sorters.every(function (fn) {
      return (compare = fn(a, b, compare)) === 0;
    });
    return compare;
  };
};