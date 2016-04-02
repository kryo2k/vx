angular.module('vx')
.factory('RevControl', function () {

  var
  numberChk = function (n) { return !isNaN(n) && isFinite(n); };

  function RevControl (history, index, maxUndo) {
    if(!angular.isArray(history)) {
      history = [history];
    }

    var
    defaultIndex = !!history.length ? 0 : -1;

    if(arguments.length < 3) {
      maxUndo = index;
      index = defaultIndex;
    }

    Object.defineProperties(this, {
      history: {
        get: function () { return history; }
      },
      maxUndo: {
        get: function () { return maxUndo; },
        set: function (v) {
          v = parseInt(v, 10);
          if(!numberChk(v)) { v = 5; }
          if(v < 0) { v = 0; }
          if(v !== maxUndo) { maxUndo = v; }
        }
      },
      history: {
        get: function () { return history; }
      },
      length: {
        get: function () { return history.length; }
      },
      head: {
        get: function () { return history[0]; }
      },
      index: {
        get: function () { return index; },
        set: function (v) {
          var length = history.length;
          v = parseInt(v, 10);
          if(!numberChk(v) || v < -1) { v = -1; }
          if(v === -1 && length > 0) { v = 0; }
          else { v = Math.min(v, length - 1); }
          if(v !== index) { index = v; }
        }
      },
      current: {
        get: function () { return history[this.index]; }
      },
      foot: {
        get: function () { return history[history.length - 1]; }
      },
      isHead: {
        get: function () { return index === 0; }
      },
      isFoot: {
        get: function () { return index === (history.length - 1); }
      }
    });

    this.index   = index;
    this.maxUndo = maxUndo;
  }

  RevControl.prototype.moveToFoot = function () {
    this.index = this.length - 1;
    return this;
  };

  RevControl.prototype.moveToHead = function () {
    this.index = 0;
    return this;
  };

  RevControl.prototype.apply = function (d, replace) {
    var
    history = this.history,
    max = this.maxUndo,
    length = this.length,
    index = this.index;

    if(d === this.head) {
      return this.moveToHead();
    }

    if(length === 0 || index === -1) {
      history.unshift(d);
      length++;
    }
    else if(!this.isHead) {
      history.splice(0, index, d);
      length = history.length;
    }
    else if(replace) {
      history[index] = d;
    }
    else {
      history.unshift(d);
      length++;
    }

    if(max > 0 && length > max) {
      history.splice(max, length - max);
    }

    return this.moveToHead();
  };

  RevControl.prototype.undo = function (steps, purge) {
    purge = !!purge;
    steps = parseInt(steps, 10);
    if(!numberChk(steps) || steps < 1) steps = 1;

    var oldIndex = this.index;
    this.index += steps;

    if(purge) {
      this.index = 0; // move to head
      this.history.splice(0, oldIndex + 1); // splice all newer
    }

    return this;
  };

  RevControl.prototype.redo = function (steps) {
    this.index -= steps||1;
    return this;
  };

  return RevControl;
});
