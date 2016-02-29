var
_ = require('lodash'),
ident = function(v) { return v; };

exports.native = function (reverse, identity) {
  var
  asc   = reverse ? -1 :  1,
  desc  = reverse ?  1 : -1,
  eq    = 0;

  identity = _.isFunction(identity) ? identity : ident;

  return function (a, b) {
    var aV = identity(a), bV = identity(b);

    if(aV > bV) return asc;
    if(aV < bV) return desc;
    return eq;
  };
}

exports.number = function (reverse, identity) {
  identity = _.isFunction(identity) ? identity : ident;
  return exports.native(reverse, function (v) {
    v = identity(v);

    if(_.isString(v)) {
      v = parseFloat(v);
    }

    return _.isNumber(v) && !isNaN(v) ? v : 0;
  });
};

exports.string = function (reverse, identity) {
  identity = _.isFunction(identity) ? identity : ident;
  return exports.native(reverse, function (v) {
    v = identity(v);
    return _.isString(v) ? v : '';
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