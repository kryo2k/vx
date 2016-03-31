'use strict';

var
_ = require('lodash');

function UniqueArrayItem (value) {

  Object.defineProperties(this, {
    value: {
      get: function () {
        return value;
      }
    },
    compareValue: {
      get: function () {
        return this.toCompare();
      }
    }
  });
}

UniqueArrayItem.prototype.toObject = function () {
  return _.clone(this.value);
};

UniqueArrayItem.prototype.toString = function () {
  return 'UAI('+JSON.stringify(this.toObject())+')';
};

UniqueArrayItem.prototype.toCompare = function () {
  return this.value;
};

UniqueArrayItem.prototype.compare = function (i) {
  var cmp = (this.constructor.compare||UniqueArrayItem.compare).bind(this.constructor);
  return cmp(this, i);
};

UniqueArrayItem.prototype.equals = function (i) {
  var eq = (this.constructor.equals||UniqueArrayItem.equals).bind(this.constructor);
  return eq(this, i);
};

UniqueArrayItem.compare = function (a, b) {
  var
  wrap = (this.wrap||UniqueArrayItem.wrap).bind(this),
  gt = 1, lt = -1, eq = 0,
  av = wrap(a).compareValue,
  bv = wrap(b).compareValue;

  if(typeof av !== typeof bv) {
    return lt;
  }

  if(av > bv) return gt;
  if(av < bv) return lt;
  return eq;
};

UniqueArrayItem.equals = function (a, b) {
  var
  compare = (this.compare||UniqueArrayItem.compare).bind(this);
  return compare(a, b) === 0;
};

UniqueArrayItem.wrap = function (v) {
  if(v instanceof this) {
    return v;
  }

  return new this(v);
};

UniqueArrayItem.wrapFunction = function (uniqueArr) {
  return (this.wrap||UniqueArrayItem.wrap).bind(this);
};

UniqueArrayItem.filterFunction = function (uniqueArr) {
  var
  parentIndexOf = uniqueArr.indexOf.bind(uniqueArr),
  itemIndexOf = (this.indexOf||UniqueArray.indexOf).bind(this);

  return function (i, index, arr) {
    return parentIndexOf(i) === -1 && itemIndexOf(i, arr) === index;
  };
};

function UniqueArray(initialItems, uaiConstructor) {
  uaiConstructor = _.isFunction(uaiConstructor)
    ? uaiConstructor
    : UniqueArrayItem;

  var
  self = this.constructor,
  indexOf = self.indexOf || UniqueArray.indexOf,
  items = [],
  itemWrapper,
  itemFilter;

  Object.defineProperties(this, {
    length: {
      get: function () {
        return items.length;
      }
    },
    keys: {
      get: function () {
        return Object.keys(items);
      }
    },
    values: {
      get: function () {
        return this.map(function (i) { return i.value; });
      }
    }
  });

  this.toObject = function () { // create a deep copy of items
    return this.map(function (i) { return i.toObject(); });
  };

  this.toString = function () {
    return 'UniqueArray('+JSON.stringify(this.toObject())+')';
  };

  this.indexOf = function (item) {
    return indexOf(item, items);
  };

  this.get = function (index) {
    if(!items.hasOwnProperty(index)) {
      return; // undefined
    }

    return items[index].value;
  };

  this.add = function () {
    var
    pushable = Array.prototype.slice.call(arguments)
      .map(itemWrapper)
      .filter(itemFilter);

    if(pushable.length > 0) {
      Array.prototype.push.apply(items, pushable);
    }

    return pushable;
  };

  this.remove = function () {
    var removeable = Array.prototype.slice.call(arguments)
    .map(this.indexOf.bind(this))
    .filter(function (rmIndex, index, arr) { // remove invalids and dups
      return rmIndex > -1 && (arr.indexOf(rmIndex) === index);
    })
    .sort(function (a, b) { return (a > b) ? -1 : (a < b) ? 1 : 0; }),
    removed = [];

    removeable.forEach((function (index) {
      Array.prototype.push.apply(removed, this.pull(index));
    }).bind(this));

    return removed;
  };

  this.pull = function (index, length) {
    if(!_.isNumber(index) || index < 0) {
      index = 0;
    }
    if(!_.isNumber(length) || length < 0) {
      length = 1;
    }

    return items.splice(index, length);
  };

  this.sort = function (reverse) {
    var delta = !!reverse ? -1 : 1;
    items.sort(function (a, b) {
      return a.compare(b) * delta;
    });
    return this;
  };

  this.forEach = function (cb) {
    return items.forEach(cb);
  };

  this.every = function (cb) {
    return items.every(cb);
  };

  this.map = function (cb) {
    return items.map(cb);
  };

  this.reduce = function (cb, iv) {
    return items.reduce(cb, iv);
  };

  this.filter = function (cb) {
    return items.filter(cb);
  };

  this.slice = function (start, end) {
    return items.slice(start, end);
  };

  itemWrapper = uaiConstructor.wrapFunction(this);
  itemFilter  = uaiConstructor.filterFunction(this);

  if(typeof initialItems !== 'undefined') {
    if(_.isArray(initialItems)) {
      this.add.apply(this, initialItems);
    }
    else {
      this.add(initialItems);
    }
  }
}

UniqueArray.indexOf = function (v, arr) {
  var index = -1;

  if(!v instanceof UniqueArrayItem) {
    return index;
  }

  arr.every(function (i, _index) {
    if(i.equals(v)) {
      index = _index;
    }

    return index === -1;
  });

  return index;
};

module.exports      = UniqueArray;
module.exports.Item = UniqueArrayItem;
