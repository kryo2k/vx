angular.module('coordinate-vx')
.factory('PaginateLazy', function ($q, $log, PaginateQuery) {

  function PaginateLazy (queryFn, queryOpts, opts) {
    var
    query = new PaginateQuery(queryFn, queryOpts, opts),
    records = [],
    lastPromise = $q.when(null),
    maxPageLoaded = null,
    defaultLimit = 0,
    appendRecords = function (rows) {
      Array.prototype.push.apply(records, rows);
      maxPageLoaded = Math.max(maxPageLoaded, query.currentPage);
      defaultLimit = query.currentLimit;
      return records;
    };

    lastPromise = query.$promise.then(appendRecords);

    this.loadMore = function () {
      if(!query.canGoNext) return $q.when(records);
      lastPromise = query.next().then(appendRecords);
      return lastPromise;
    };

    this.reload = function () {
      maxPageLoaded = null;
      records.splice(0, records.length); // remove previous records
      lastPromise = query.moveFirst().then(appendRecords);
      return lastPromise
    };

    this.truncate = function (num) {
      num = (!angular.isNumber(num)||num<0)?defaultLimit:num;

      var length = records.length;

      if(num > 0 && length > num) {
        records.splice(num, length);
        maxPageLoaded = 1;
        query.setData(records, null, null, maxPageLoaded);
      }
    };

    Object.defineProperties(this, {
      '$promise': { get: function () { return lastPromise; } },
      length: { get: function () { return records.length; } },
      records: { get: function () { return records; } }
    });

    return this;
  };

  return PaginateLazy;
});
