angular.module('coordinate-vx')
.factory('PaginateQuery', function ($q, $log) {

  function PaginateQuery (queryFn, queryOpts, opts) {
    opts = angular.isObject(opts) ? opts : {};

    var
    lastPromise = $q.when(null),
    // properties on resulting object
    rpdocs      = opts.resultDocs      || 'docs',
    rppage      = opts.resultPage      || 'page',
    rppagetot   = opts.resultPageTotal || 'pages',
    rptotal     = opts.resultTotal     || 'total',
    rplimit     = opts.resultLimit     || 'limit',

    // properties on queryOpts (input)
    qpage       = opts.queryPage       || 'page',
    qlimit      = opts.queryLimit      || 'limit',

    // last values grabbed from result
    rdocs       = null,
    rtotalrec   = null,
    rtotalpage  = null,
    rcurrpage   = null,
    rcurrlimit  = null;

    function isPaginated(data) {
      return angular.isObject(data)
        && angular.isArray(data[rpdocs])
        && angular.isNumber(data[rppage])
        && angular.isNumber(data[rppagetot])
        && angular.isNumber(data[rptotal])
        && angular.isNumber(data[rplimit]);
    }

    this.next = function () {
      if(!this.canGoNext) return $q.when(false);
      return this.load(rcurrpage + 1);
    };

    this.prev = function () {
      if(!this.canGoPrev) return $q.when(false);
      return this.load(rcurrpage - 1);
    };

    this.load = function (page, limit, params) {
      var
      nopts = angular.merge({}, queryOpts, params);

      if(angular.isNumber(page))  nopts[qpage]  = page;
      if(angular.isNumber(limit)) nopts[qlimit] = limit;

      var promise = queryFn(nopts);

      if(!promise) return $q.when(promise);

      if(promise.hasOwnProperty('$promise')) {
        promise = promise.$promise;
      }

      if(!angular.isFunction(promise.then)) {
        return $q.when(promise);
      }

      promise = lastPromise = promise.then(function (data) {
          if(!isPaginated(data)) { // pass thru data
            $log.warn('Data received does not appear to be paginated.', data);
            return data;
          }

          // sync internals with data received
          rdocs      = data[rpdocs];
          rtotalrec  = data[rptotal];
          rtotalpage = data[rppagetot];
          rcurrpage  = data[rppage];
          rcurrlimit = data[rplimit];

          // return the documents we got thru the promise.
          return rdocs;
        });

      return promise;
    };

    Object.defineProperties(this, {
      '$promise':   { get: function () { return lastPromise; } },
      length:       { get: function () { return !!rdocs ? rdocs.length : 0; } },
      records:      { get: function () { return rdocs; } },
      totalRecords: { get: function () { return rtotalrec; } },
      totalPages:   { get: function () { return rtotalpage; } },
      currentPage:  { get: function () { return rcurrpage; } },
      currentLimit: { get: function () { return rcurrlimit; } },
      canGoNext:    { get: function () { return angular.isNumber(rcurrpage) && angular.isNumber(rtotalpage) && rcurrpage < rtotalpage; } },
      canGoPrev:    { get: function () { return angular.isNumber(rcurrpage) && rcurrpage > 1; } }
    });

    this.load(); // load on create

    return this;
  };

  return PaginateQuery;
});
