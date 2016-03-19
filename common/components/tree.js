var
_ = require('lodash');

function Tree () {
  this.init.apply(this, arguments);
}

Tree.isString = _.isString;
Tree.isNumber = _.isNumber;
Tree.isArray  = _.isArray;
Tree.isObject = _.isObject;
Tree.PATH_DELIM = '/';
Tree.ROOT     = 'root';

Tree.isTree = function (m) {
  return Tree.isObject(m) && m instanceof Tree;
};

Tree.wrap = function (m) {
  if(Tree.isTree(m)) {
    return m;
  }

  return new this(m);
};

Tree.wrapArguments = function (args) {
  return Array.prototype.slice.call(args).map(Tree.wrap.bind(this));
};

Tree.mapParentUnbind = function (node) {
  node.parent = null;
  return node;
};

Tree.mapParentBind = function (node) {
  var parent = this;

  if(!node.hasOwnProperty('parent')) {
    Object.defineProperty(node, 'parent', {
      get: function () {
        return parent;
      },
      set: function (v) {
        parent = Tree.isTree(v) ? v : null;
      }
    });
  }
  else {
    node.parent = parent;
  }

  return node;
};

Tree.prototype.init = function (opts) {
  if(this.hasOwnProperty('children')) { // already initialized
    return this.configure(opts);
  }

  var // private data storage elements
  children = [],
  params = {};

  Object.defineProperties(this, {
    children: {
      get: function () { return children; }
    },
    params: {
      get: function () { return params; }
    },
    paramKeys: {
      get: function () { return Object.keys(params); }
    },
    paramKeysInherited: {
      get: function () {
        var
        keys = [], child = this,
        parent = this.parent;

        while(parent && child) {
          Array.prototype.push.apply(keys, parent.paramKeys
            .filter(function (key, index) {
              return !child.has(key);
            }));
          child = parent;
          parent = child.parent;
        }

        return keys;
      }
    },
    shallowLength: {
      get: function () { return children.length; }
    },
    deepLength: {
      get: function () { return children.reduce(function (p, child) {
        return p + child.deepLength + 1;
      }, 0); }
    },
    path: {
      get: function () {
        if(!this.parent) {
          return Tree.ROOT;
        }

        var
        myIndex = this.parent.children.indexOf(this);

        if(myIndex === -1) {
          return '???';
        }

        return this.parent.path + Tree.PATH_DELIM + myIndex;
      }
    },
    root: {
      get: function () {
        var R = this;
        while(R.parent) {
          R = R.parent;
        }
        return R;
      }
    }
  });

  return this.configure(opts);
};

Tree.prototype.toObject = function (inherit) {
  var
  result = {},
  allParams = this.getParams(null, inherit),
  allChildren = this.children.map(function (child) {
    return child.toObject(inherit);
  });

  if(Object.keys(allParams).length > 0) {
    result.params = allParams;
  }

  if(allChildren.length > 0) {
    result.children = allChildren;
  }

  return result;
};

Tree.prototype.toString = function (inherit) {
  return 'Tree('+JSON.stringify(this.toObject(inherit))+')';
};

Tree.prototype.has = function (key) {
  return this.params.hasOwnProperty(key);
};

Tree.prototype.get = function (key, inheritParams, defaultVal) {
  var parent = this.parent;

  if(!this.has(key)) {
    while(inheritParams && parent) {
      if(parent.has(key)) {
        return parent.get(key, false);
      }
      parent = parent.parent;
    }

    return defaultVal;
  }
  return this.params[key];
};

Tree.prototype.getParams = function (keys, inheritParams) {
  keys = (!Tree.isArray(keys)||!keys.length)
    ? (inheritParams ? this.paramKeysInherited : this.paramKeys)
    : keys;

  return keys.reduce((function (p, key) {
    p[key] = this.get(key, inheritParams);
    return p;
  }).bind(this), {});
};

Tree.prototype.unset = function (key) {
  delete this.params[key];
  return this;
};

Tree.prototype.set = function (key, value) {
  this.params[key] = value;
  return this;
};

Tree.prototype.setParams = function (p) {
  if(!Tree.isObject(p)) { // exit
    return this;
  }

  Object.keys(p).forEach((function (key) {
    this.set(key, p[key]);
  }).bind(this));

  return this;
};

Tree.prototype.child = function (index) {
  return this.children[index]||false;
};

Tree.prototype.nav = function (path) {

  var R = this, shallowLength = this.shallowLength;

  if(Tree.isString(path)) {

    var
    pe, pel = path.split(Tree.PATH_DELIM)
    .filter(function (v) {
      return v.length > 0;
    });

    while(R && (pe = pel.shift()) !== undefined) {
      if(pe === '.') {
        continue;
      }
      else if(pe === '..') {
        R = R.parent||false;
        continue;
      }
      else if(pe === 'root') {
        R = R.root;
        continue;
      }

      var index = parseInt(pe, 10);

      if(isNaN(index) || index < 0 || index >= shallowLength) {
        R = false;
        break;
      }

      R = R.child(index);
    }
  }

  return R;
};

Tree.prototype.push = function () {
  Array.prototype.push.apply(this.children, Tree.wrapArguments(arguments)
    .map(Tree.mapParentBind.bind(this)));
  return this;
};

Tree.prototype.splice = function () {
  var
  argarr = Array.prototype.slice.call(arguments),
  index  = argarr.shift(),
  remove = argarr.shift(),
  nodes  = Tree.wrapArguments(argarr).map(Tree.mapParentBind.bind(this));
  nodes.unshift(index, remove);
  return Array.prototype.splice.apply(this.children, nodes).map(Tree.mapParentUnbind);
};

Tree.prototype.configure = function (opts) {
  if(!Tree.isObject(opts)) {
    return this;
  }
  if(Tree.isArray(opts.children)) {
    this.push.apply(this, opts.children);
  }
  if(Tree.isObject(opts.params)) {
    this.setParams(opts.params);
  }

  return this;
};

Tree.prototype.clear = function (m) {
  this.children.splice(0, this.shallowLength);
  return this;
};

module.exports = Tree;