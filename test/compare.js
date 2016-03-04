var
format = require('util').format,
compare = require('../common/components/compare');

function testSort (test, compareFn) {
  return function (spec, index) {
    var cval = compareFn(spec[0], spec[1]);
    test.equals(cval, spec[2], format('comparing (%j and %j), expected (%j) and received (%j)', spec[0], spec[1], spec[2], cval));
  };
}

exports.testNative = function (test) {
  [
    ['a', 'b', -1],
    [  1,   2, -1],
    [  2,   1,  1],
    [  2,   2,  0]
  ].forEach(testSort(test, compare.native(false)));

  [
    ['a', 'b',  1],
    [  1,   2,  1],
    [  2,   1, -1],
    [  2,   2,  0]
  ].forEach(testSort(test, compare.native(true)));

  test.done();
};
exports.testEnum = function (test) {

  [
    ['one',   'two', -1],
    ['two', 'three', -1],
    ['three', 'one',  1],
    ['two',   'two',  0]
  ].forEach(testSort(test, compare.enum(false, ['one','two','three'])));

  test.done();
};
exports.testNumber = function (test) {

  [
    [1,  2, -1],
    [2,  3, -1],
    [10, 1,  1],
    [0,  0,  0]
  ].forEach(testSort(test, compare.number(false)));

  test.done();
};
exports.testString = function (test) {

  [
    ['apple',  'cucumber', -1],
    ['carrot', 'zuquini',  -1],
    ['tomato', 'beet',      1],
    ['beef',   'beef',      0]
  ].forEach(testSort(test, compare.string(false)));

  test.done();
};
exports.testStringNoCase = function (test) {

  [
    ['Apple',  'cucumber', -1],
    ['Carrot', 'zuquini',  -1],
    ['Tomato', 'beet',      1],
    ['BeEF',   'beef',      0]
  ].forEach(testSort(test, compare.stringNoCase(false)));

  test.done();
};
exports.testMultiCompare = function (test) {

  var propIdentFunc = function (prop) {
    return function (o) {
      return o ? o[prop] : null;
    };
  };

  [
    [{ v0: 0, v1: 0 }, { v0: 1, v1: 0 }, -1],
    [{ v0: 0, v1: 0 }, { v0: 0, v1: 1 }, -1],
    [{ v0: 1, v1: 0 }, { v0: 0, v1: 0 },  1],
    [{ v0: 0, v1: 1 }, { v0: 0, v1: 0 },  1],
    [{ v0: 0, v1: 0 }, { v0: 0, v1: 0 },  0],
    [{ v0: 1, v1: 1 }, { v0: 1, v1: 1 },  0]
  ].forEach(testSort(test, compare.multiCompare([
    compare.number(false, propIdentFunc('v0')),
    compare.number(false, propIdentFunc('v1'))
  ])));

  test.done();
};