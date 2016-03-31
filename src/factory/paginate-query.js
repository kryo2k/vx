angular.module('coordinate-vx')
.factory('PaginateQuery', function ($q, $log) {

  function PaginateQuery (queryFn, queryOpts, opts) {
    opts = angular.isObject(opts) ? opts : {};

    var
    loading     = false,
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
      if(rcurrpage === null) return this.load();
      if(!this.canGoNext) return $q.when(false);
      return this.load(rcurrpage + 1);
    };

    this.prev = function () {
      if(rcurrpage === null) return this.load();
      if(!this.canGoPrev) return $q.when(false);
      return this.load(rcurrpage - 1);
    };

    this.reset = function (load) {
      lastPromise = $q.when(null);
      rdocs = null;
      rtotalrec = null;
      rtotalpage = null;
      rcurrpage = null;
      rcurrlimit = null;
      if(load) this.load();
      return this;
    };

    this.moveFirst = function (limit, params) {
      return this.load(1, limit, params);
    };

    this.moveLast = function (limit, params) {
      return this.load(rtotalpage, limit, params);
    };

    this.setData = function (docs, totalRecords, totalPages, currentPage, currentLimit) {
      rdocs      = docs || rdocs;
      rtotalrec  = totalRecords || rtotalrec;
      rtotalpage = totalPages || rtotalpage;
      rcurrpage  = currentPage || rcurrpage;
      rcurrlimit = currentLimit || rcurrlimit;
      return this;
    };

    this.load = function (page, limit, params) {
      var
      nopts = angular.merge({}, queryOpts, params),
      setData = this.setData.bind(this);

      if(loading) return lastPromise;

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

      loading = true;
      promise = lastPromise = promise.then(function (data) {
        if(!isPaginated(data)) { // pass thru data
          $log.warn('Data received does not appear to be paginated.', data);
          return data;
        }

        // sync internals with data received
        setData(data[rpdocs], data[rptotal], data[rppagetot], data[rppage], data[rplimit]);

        // return the documents we got thru the promise.
        return rdocs;
      })
      .finally(function () {
        loading = false;
      });

      return promise;
    };

    Object.defineProperties(this, {
      '$promise':   { get: function () { return lastPromise; } },
      length:       { get: function () { return !!rdocs ? rdocs.length : 0; } },
      loading:      { get: function () { return loading; } },
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
