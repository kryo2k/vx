var
format = require('util').format,
mongoUtil = require('../common/components/mongo-util'),
ObjectId = require('mongoose').Types.ObjectId;

exports.isObjectId = function (test) {

  [ // valid
    '56d811ac3f52ea356237d242',
    '000000000000000000000001',
    new ObjectId()
  ].forEach(function (v, index) {
    test.equals(mongoUtil.isObjectId(v), true, format('(%d:%s) expected true, got false', index, v));
  });

  [ // invalid
    false,
    null,
    undefined,
    NaN,
    new Date(),
    '0',
    '00',
    '000',
    '0000',
    '00000',
    '000000',
    '0000000',
    '00000000',
    '000000000',
    '0000000000',
    '00000000000',
    // '000000000000', // valid
    '0000000000000',
    '00000000000000',
    '000000000000000',
    '0000000000000000',
    '00000000000000000',
    '000000000000000000',
    '0000000000000000000',
    '00000000000000000000',
    '000000000000000000000',
    '0000000000000000000000',
    '00000000000000000000000',
    // '000000000000000000000000', // valid
  ].forEach(function (v, index) {
    test.equals(mongoUtil.isObjectId(v), false, format('(%d:%s) expected false, got true', index, v));
  });

  test.done();
};

exports.getObjectId = function (test) {

  [
    new ObjectId(),
    '000000000000',
    '000000000000000000000000',
    '56d811ac3f52ea356237d242',
    '000000000000000000000001',
    { _id: '000000000000000000000001' },
    { id: '000000000000000000000001' }
  ].forEach(function (v, index) {
    test.equals(mongoUtil.getObjectId(v) instanceof ObjectId, true, format('(%d:%s) expected an object id returned', index, v));
  });

  [
    new Date(),
    null,
    false,
    undefined,
    { food: null }
  ].forEach(function (v, index) {
    test.equals(mongoUtil.getObjectId(v) instanceof ObjectId, false, format('(%d:%s) expected a false, and got an object id returned', index, v));
  });

  test.done();
};

exports.arrayOfObjectId = function (test) {
  [
    [[
      { id: '000000000000000000000001' },
      { id: '000000000000000000000002' },
      { id: '000000000000000000000003' }
    ], [
      '000000000000000000000001',
      '000000000000000000000002',
      '000000000000000000000003'
      ]
    ],
    [[
      { _id: '000000000000000000000001' },
      { _id: '000000000000000000000002' },
      { _id: '000000000000000000000003' }
    ], [
      '000000000000000000000001',
      '000000000000000000000002',
      '000000000000000000000003'
      ]
    ],
    [[
      new ObjectId('000000000000000000000001'),
      new ObjectId('000000000000000000000002'),
      new ObjectId('000000000000000000000003')
    ], [
      '000000000000000000000001',
      '000000000000000000000002',
      '000000000000000000000003'
      ]
    ]
  ].forEach(function (arr) {
    test.equals(JSON.stringify(mongoUtil.arrayOfObjectId(arr[0])), JSON.stringify(arr[1]));
  });

  test.done();
};

exports.isIdEqual = function (test) {

  [
    ['000000000000000000000001',         new ObjectId('000000000000000000000001')],
    [{ _id: '000000000000000000000001'}, new ObjectId('000000000000000000000001')],
    [{ id: '000000000000000000000001'},  new ObjectId('000000000000000000000001')]
  ].forEach(function (arr, index) {
    test.equals(mongoUtil.isIdEqual(arr[0], arr[1]), true, format('(%d: %j === %j) were not equal', index, arr[0], arr[1]));
  });

  test.done();
};