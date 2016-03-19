var
Tree = require('../common/components/tree');

exports.simpleTreeLength = function (test) {
  var tree = new Tree({
    children: [{}, {}]
  });

  test.equals(tree.shallowLength, 2);
  test.equals(tree.deepLength, 2);
  test.done();
};

exports.deepTreeLength = function (test) {
  var tree = new Tree({
    children: [{ children: [{}, {}] }, {}]
  });

  test.equals(tree.shallowLength, 2);
  test.equals(tree.deepLength, 4);
  test.done();
};

exports.simpleTreeParam = function (test) {
  var tree = new Tree({
    params: {
      test: true
    }
  });

  test.equals(tree.shallowLength, 0);
  test.equals(tree.deepLength, 0);
  test.equals(tree.get('test'), true);

  tree.set('test', false); // internal set
  test.equals(tree.get('test'), false);

  test.done();
};

exports.inheritedTreeParam = function (test) {
  var tree = new Tree({
    params: {
      test: false
    },
    children: [{
      params: {
        test: true
      }
    }, {
    }]
  });

  test.equals(tree.child(0).get('test'), true);
  test.equals(tree.child(1).get('test'), undefined);
  test.equals(tree.child(1).get('test', true), false);

  test.done();
};

exports.navFromRoot = function (test) {
  var tree = new Tree({
    params: { name: 'one' },
    children: [
      {
        params: { name: 'two' },
        children: [
          {
            params: { name: 'three' },
            children: [{
              params: { name: 'four' },
            }]
          }
        ]
      }
    ]
  });

  test.equals(tree.nav('root/0/0/0').get('name'), 'four');
  test.equals(tree.nav('./0/0/0').get('name'), 'four');
  test.equals(tree.nav('0/0/0').get('name'), 'four');
  test.equals(tree.nav('0/0/0').nav('..').get('name'), 'three');
  test.equals(tree.nav('0/0/0').nav('../..').get('name'), 'two');
  test.equals(tree.nav('0/0/0').nav('../../..').get('name'), 'one');
  test.equals(tree.nav('0/0/0').nav('../../../..'), false);
  test.equals(tree.nav('0/0/0/0'), false);
  test.equals(tree.nav('1/0/0'), false);
  test.done();
};

exports.treeToObject = function (test) {
  var
  json = {
    params: {
      1: 1,
      2: 2,
      3: 3
    },
    children: [{
    },{
    },{
      children: [{
        params: {
          1: 5
        }
      },{
      },{
      }]
    }]
  },
  tree = new Tree(json);

  console.log(String(tree.nav('2/0')));

  test.equals(JSON.stringify(tree.toObject()), JSON.stringify(json));
  test.equals(JSON.stringify(tree.nav('2/0').toObject(true)), JSON.stringify({ params: { 1: 5, 2: 2, 3: 3} }));
  test.done();
};