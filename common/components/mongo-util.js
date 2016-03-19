'use strict';

var
mongoose = require('mongoose'),
_ = require('lodash'),
ObjectId = mongoose.Types.ObjectId;

function isObjectId(n) {
  return (ObjectId.isValid(n) || n instanceof ObjectId) && !(typeof n ==='number' && isNaN(n));
}

function getObjectId(n) {
  if(!n) return false;

  if(isObjectId(n)) {
    return new ObjectId(n);
  }

  if(_.isObject(n) && (!!n._id || !!n.id)) {
    return new ObjectId(n._id || n.id);
  }

  return false;
}

function arrayOfObjectId (m) {
  if(!m) return false;
  if(!_.isArray(m)) {
    m = [m];
  }

  var
  filtered = m.reduce(function (p, c) {
    var objectId = getObjectId(c);
    if(objectId !== false) {
      p.push(objectId);
    }
    return p;
  }, []);

  if(!filtered.length) {
    return false;
  }

  return filtered;
}

function isIdEqual(a, b) {
  var
  aO = getObjectId(a),
  bO = getObjectId(b);

  if(!aO || !bO) {
    return false;
  }

  return aO.equals(bO);
};

module.exports = {
  isObjectId: isObjectId,
  isIdEqual: isIdEqual,
  getObjectId: getObjectId,
  arrayOfObjectId: arrayOfObjectId
};