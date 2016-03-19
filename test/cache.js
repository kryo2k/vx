var
cache = require('../common/components/cache'),
MemoryCache = cache.Memory;

exports.memoryCacheSimpleConstruct = function (test) {
  var c = new MemoryCache();
  test.equal(c instanceof MemoryCache, true, 'Constructed was not a MemoryCache instance.');
  test.done();
};

exports.memoryCacheSimpleUsage = function (test) {
  var
  testKey = 'some-key',
  testValue = 'Hans',
  c = new MemoryCache();

  c.check(testKey, function () {
    return testValue;
  })
  .then(function (got) {
    test.equals(got, testValue);
    return got;
  })
  .finally(test.done.bind(test));
};

exports.memoryCacheTTLUsage = function (test) {
  var
  maxTTL  = 500,
  testKey = 'some-key',
  testValue = 'Hans',
  c = new MemoryCache({ ttl: maxTTL });

  var
  loopCount = 1, loopIntv = maxTTL / 5,
  loop5X = function () {

    c.check(testKey).then(function (got) {
      test.equals(got, testValue, 'Expected '+JSON.stringify(testValue)+' and got ' + JSON.stringify(got)+'.');

      if(loopCount < 5) {
        loopCount++;
        setTimeout(loop5X, loopIntv);
        return;
      }

      setTimeout(function () {
        c.check(testKey).then(function (nowGot) {
          test.equals(nowGot, null, 'Expected null and got ' + JSON.stringify(nowGot)+'.');
          test.equals(c.get(testKey), null); // key should be unset
          test.done();
        });
      }, loopIntv);
    });
  };

  // ensure testKey is populated, then start loop
  c.check(testKey, function () { return testValue; }).then(loop5X);
};