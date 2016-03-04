var
objectDot = require('../common/components/object-dot');

exports.getSimple = function (test) {
  test.equal(objectDot.get({ test: true }, 'test'), true);
  test.done();
};

exports.getNestedObject = function (test) {
  test.equal(objectDot.get({ test: { one: { two: true } } }, 'test.one.two'), true);
  test.done();
};

exports.getNestedArrayValue = function (test) {
  test.equal(objectDot.get({ data: [{ test: true }] }, 'data.0.test'), true);
  test.done();
};

exports.getNestedMissingObjectValue = function (test) {
  test.equal(objectDot.get({ data: { data2: { data3: true }} }, 'data.data2.data5'), undefined);
  test.done();
};

exports.getNestedMissingObjectDefaultValue = function (test) {
  test.equal(objectDot.get({ data: { data2: { data3: true }} }, 'data.data2.data5', false), false);
  test.done();
};

exports.getNestedMissingArrayValue = function (test) {
  test.equal(objectDot.get({ data: [] }, 'data.0'), undefined);
  test.done();
};

exports.hasSimple = function (test) {
  test.equal(objectDot.has({ 'test': true }, 'test'), true);
  test.done();
};

exports.hasNestedObjectValue = function (test) {
  test.equal(objectDot.has({ 0: { 1: { 2: true } }  }, '0.1.2'), true);
  test.done();
};

exports.hasNestedArrayValue = function (test) {
  test.equal(objectDot.has({ 0: { 1: [{ 2: true }] }  }, '0.1.0.2'), true);
  test.done();
};

exports.hasObjectOnArray = function (test) {
  test.equal(objectDot.has([[],[{test: true}]], '1.0.test'), true);
  test.done();
};

exports.setSimple = function (test) {
  var t = {}, k = 'test', v = true;
  objectDot.set(t, k, v);
  test.equal(objectDot.get(t, k), v);
  test.done();
};

exports.setNestedObject = function (test) {
  var t = {}, k = '0.1.2.3.4.5', v = true;
  test.ok(objectDot.set(t, k, v), 'Expected objectDot.set to return true.');
  test.equal(objectDot.get(t, k), v);
  test.equal(JSON.stringify(t), JSON.stringify({ '0': { '1': { '2': { '3': { '4': { '5': v } } } } } }));
  test.done();
};

exports.setNestedArray = function (test) {
  var t = {}, v = true;
  test.ok(objectDot.set(t, 'data.$.test', v), 'Expected objectDot.set to return true.');
  test.equal(objectDot.get(t, 'data.0.test'), v);
  test.equal(JSON.stringify(t), JSON.stringify({ 'data': [{ test: v }] }));
  test.done();
};

exports.setNestedArrayExisting = function (test) {
  var t = { data: [{ test: false }] }, v = true;
  test.ok(objectDot.set(t, 'data.$.test', v), 'Expected objectDot.set to return true.');
  test.equal(objectDot.get(t, 'data.1.test'), v);
  test.equal(JSON.stringify(t), JSON.stringify({ 'data': [{ test: false }, { test: v }] }));
  test.done();
};

exports.setNestedObjectNoCreateOneLevel = function (test) {
  var t = {}, v = true;
  test.ok(objectDot.set(t, 'data', v, false), 'Expected objectDot.set to return true.');
  test.equal(JSON.stringify(t), JSON.stringify({ data: v }));
  test.done();
};

exports.setNestedObjectNoCreateTwoLevel = function (test) {
  var t = {}, v = true;
  test.ok(!objectDot.set(t, 'data.test', v, false), 'Expected objectDot.set to return false.');
  test.equal(JSON.stringify(t), JSON.stringify({}));
  test.done();
};

exports.setNestedArrayNoCreateOneLevel = function (test) {
  var t = { data: [] }, v = true;
  test.ok(objectDot.set(t, 'data.$', v, false), 'Expected objectDot.set to return true.');
  test.equal(JSON.stringify(t), JSON.stringify({ data: [true] }));
  test.done();
};

exports.setNestedArrayNoCreateTwoLevel = function (test) {
  var t = { data: [] }, v = true;
  test.ok(!objectDot.set(t, 'data.$.xyz', v, false), 'Expected objectDot.set to return false.');
  test.equal(JSON.stringify(t), JSON.stringify({ data: [] }));
  test.done();
};

exports.setNestedArrayNoCreateOnArray = function (test) {
  var t = [], v = true;
  test.ok(objectDot.set(t, '$', v, false), 'Expected objectDot.set to return true.');
  test.equal(JSON.stringify(t), JSON.stringify([v]));
  test.done();
};

exports.setNestedArrayNoCreateOnArray = function (test) {
  var t = [], v = true;
  test.ok(!objectDot.set(t, '$.something', v, false), 'Expected objectDot.set to return false.');
  test.equal(JSON.stringify(t), JSON.stringify([]));
  test.done();
};