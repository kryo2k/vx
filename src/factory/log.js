angular.module('vx')
.service('Log', function () {

  function Log (data, maxLength, addToStart) {

    if(arguments.length === 0) {
      data = [];
      maxLength = 20;
    }
    else if(!angular.isArray(data)) {
      data = [data];
    }

    maxLength = (angular.isNumber(maxLength) && maxLength > 0) ? maxLength : 0;

    if(addToStart) {
      data.reverse();
    }

    Object.defineProperties(this, {
      maxLength: {
        get: function () { return maxLength; }
      },
      length: {
        get: function () { return data.length; }
      },
      records: {
        get: function () { return data; }
      }
    });

    var truncate = (function () {
      if(maxLength === 0) return this;

      var
      rmnum = (this.length - maxLength);

      if(rmnum > 0) {
        if(addToStart) { // remove from end
          data.splice(maxLength, rmnum);
        }
        else { // remove from start
          data.splice(0, rmnum);
        }
      }

      return this;
    }).bind(this);

    truncate(); // any data loaded from constructor

    this.add = function () {
      var
      adding = Array.prototype.slice.call(arguments),
      addfn  = addToStart ? Array.prototype.unshift : Array.prototype.push,
      mapfn  = angular.identity;

      if(addToStart) {
        adding.reverse();
      }

      if(adding.length === 0) return this;

      if(angular.isFunction(this.item)) {
        mapfn = this.item.bind(this);
      }

      addfn.apply(data, adding.map(mapfn));

      return truncate();
    };
  }

  return Log;
});
