'use strict';

var
_ = require('lodash'),
UniqueArray = require('../common/components/unique-array'),
UAItem = UniqueArray.Item;

module.exports = {
  createArrayClass: function (test) {
    var obj = new UniqueArray();
    test.equals(obj instanceof UniqueArray, true, 'Object is not an instance of UniqueArray');
    test.equals(obj.length, 0, 'UniqueArray length should be zero.');
    test.done();
  },
  createItemClass: function (test) {
    var
    tval = 'Test Value',
    obj = new UAItem(tval);
    test.equals(obj instanceof UAItem, true, 'Object is not an instance of UniqueArray.Item');
    test.equals(obj.value, tval, 'UniqueArray.Item value did not match expected');
    test.equals(obj.compare(tval), 0, 'UniqueArray.Item.compare value did not return 0');
    test.equals(obj.equals(tval), true, 'UniqueArray.Item.equals value did not return true');

    test.equals(UAItem.wrap(1).compare(true), -1, 'Expected -1');
    test.equals(UAItem.wrap(1).compare(2),    -1, 'Expected -1');
    test.equals(UAItem.wrap(2).compare(1),     1, 'Expected  1');
    test.equals(UAItem.wrap(2).compare(2),     0, 'Expected  0');

    test.done();
  },
  simpleUsage: function (test) {
    var
    arr = new UniqueArray([1, 2, 3, true, 2, 3, 1, 2, 3]);
    test.equals(arr instanceof UniqueArray, true, 'Object is not an instance of UniqueArray');
    test.equals(arr.length, 4, 'UniqueArray length was not 4');
    test.equals(arr.toString(), 'UniqueArray([1,2,3,true])', 'UniqueArray did not match expected');
    test.equals(arr.get(0), 1, 'UniqueArray index 0 should be value 1');
    test.equals(arr.get(1), 2, 'UniqueArray index 1 should be value 2');
    test.equals(arr.get(2), 3, 'UniqueArray index 2 should be value 3');
    test.equals(arr.get(3), true, 'UniqueArray index 3 should be value "true"');

    arr.add(3);
    arr.add(2);
    arr.add(3, 2, 1);
    arr.add(1, 2, 3);
    test.equals(arr.length, 4, 'Expected length to remain to be 4');

    arr.add(5);
    test.equals(arr.length, 5, 'Expected length to become 5');
    test.equals(arr.indexOf(5), 4, 'Expected index of 5 to be 4');

    test.equals(arr.indexOf(arr.get(0)), 0, 'Index should have been 0');
    test.equals(arr.indexOf(arr.get(1)), 1, 'Index should have been 1');
    test.equals(arr.indexOf(arr.get(2)), 2, 'Index should have been 2');
    test.equals(arr.indexOf(arr.get(3)), 3, 'Index should have been 3');
    test.equals(arr.indexOf(arr.get(4)), 4, 'Index should have been 4');

    test.done();
  }
};



//////////////////////////////////////////////////////////////////////

// var
// inherits = require('util').inherits;

// function ExtItem() {
//   UniqueArrayItem.apply(this, arguments);
// }

// inherits(ExtItem, UniqueArrayItem);

// function ExtArray() {
//   UniqueArray.apply(this, arguments);
// }

// inherits(ExtArray, UniqueArray);

// var
// arr = new ExtArray();
