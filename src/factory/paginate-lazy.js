angular.module('vx')
.factory('PaginateLazy', function ($q, $log, PaginateQuery) {

  function PaginateLazy (queryFn, queryOpts, opts) {
    var
    query = new PaginateQuery(queryFn, queryOpts, opts),
    records = [],
    totalPages = null,
    totalRecords = null,
    lastPromise = $q.when(null),
    maxPageLoaded = null,
    appendRecords = function (rows) {
      Array.prototype.push.apply(records, rows);
      maxPageLoaded = Math.max(maxPageLoaded, query.currentPage);

      totalRecords = query.totalRecords||null;
      totalPages = query.totalPages||null;

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
      num = (!angular.isNumber(num)||num<0)?query.currentLimit:num;

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
      totalPages: { get: function () { return totalPages; } },
      totalRecords: { get: function () { return totalRecords; } },
      records: { get: function () { return records; } },
      rawQuery: { get: function () { return query; } },
      lastParams: { get: function () { return !query ? null : query.params; } },
      lastData: { get: function () { return !query ? null : query.data; } },
      canLoadMore: { get: function () { return totalPages > maxPageLoaded; }}
    });

    return this;
  };

  return PaginateLazy;
});
