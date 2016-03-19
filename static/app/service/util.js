angular.module('coordinate-vx')
.service('$isNull', function () {
  return function (v) { return v === null; };
})
.service('$isUndefined', function () {
  return function (v) { return v === undefined; };
})
.service('$isNullUndefined', function ($isNull, $isUndefined) {
  return function (v) { return $isNull(v) || $isUndefined(v); };
})
.service('$isString', function () {
  return function (v) { return typeof(v) === 'string'; };
})
.service('$isBoolean', function () {
  return function (v) { return typeof(v) === 'boolean'; };
})
.service('$isNumber', function () {
  return function (v) { return typeof(v) === 'number' && !isNaN(v); };
})
.service('$isNumberBetween', function ($isNumber) {
  return function (v, n1, n2) {
    if(!$isNumber(v) || !$isNumber(n1) || !$isNumber(n2))  {
      return false;
    }

    return v >= Math.min(n1, n2) && v <= Math.max(n1, n2);
  };
})
.service('$isScalar', function ($isNull, $isString, $isNumber, $isBoolean) {
  return function (v) {
    return !$isNull(v) && ($isString(v) || $isNumber(v) || $isBoolean(v));
  };
})
.service('$isPrimitive', function ($isNull, $isString, $isNumber, $isBoolean, $isUndefined) {
  return function (v) {
    return !$isNull(v) && ($isString(v) || $isNumber(v) || $isBoolean(v) || $isUndefined(v));
  };
})
.service('$isFunction', function () {
  return angular.isFunction;
})
.service('$isArray', function () {
  return angular.isArray;
})
.service('$isPlainObject', function () {
  return function (v) { // only matches {} not new (Date|Buffer|Array...)
    return Object.prototype.toString.call(v) === '[object Object]';
  };
})
.service('$isObjectType', function () {
  return function (str) {
    return str === 'object';
  };
})
.service('$isObject', function ($isNull, $isFunction, $isObjectType) {
  return function (v, instanceCheck) { // matches all types of objects, unless instanceCheck is provided a function.

    var
    result = !$isNull(v) && $isObjectType(typeof v);

    if(result && $isFunction(instanceCheck)) { // enforce instanceof checking
      if(false === v instanceof instanceCheck) {
        result = false;
      }
    }

    return result;
  };
})
.service('$isDate', function () {
  return function (v) { // matches only Date object instances
    return $isObject(v, Date);
  };
})
.service('$asNumber', function ($isNumber, $isNullUndefined) {
  return function (v, defaultVal) {
    defaultVal = $isNumber(defaultVal) ? defaultVal : 0;

    if ($isNullUndefined(v)) { return defaultVal; }
    if ($isNumber(v)) { return v; }

    var n = parseFloat(v);
    if (isNaN(n)) { return defaultVal; }
    return n;
  }
})
.service('$asBoolean', function ($isBoolean, $isNumber, $isString, $isNullUndefined) {
  return function (v, defaultVal) {
    defaultVal = $isBoolean(defaultVal) ? defaultVal : false;

    if($isNullUndefined(v)) {
      return defaultVal;
    }

    if($isBoolean(v)) { // return original value if is a boolean
      return v;
    }
    else if($isNumber(v)) { // return true if equal to 1
      return v === 1;
    }
    else if($isString(v)) { // return true  if matches one of the below
      return ['yes','true','1','on','enabled','enable'].indexOf(v.toLowerCase()) > -1;
    }

    return defaultVal;
  }
})
.service('$asString', function ($isNullUndefined, $isString) {
  return function (v, defaultVal) {
    defaultVal = $isString(defaultVal) ? defaultVal : '';

    if($isNullUndefined(v)) {
      return defaultVal;
    }

    if($isString(v)) { // return original value if is a string
      return v;
    }

    return String(v);
  }
})
.service('$round', function ($isNumber) {
  return function  (v, precision) {
    if(!$isNumber(v)) { return NaN; }

    precision = Math.abs(Math.round(isNaN(precision) ? 0 : precision));
    var f = Math.pow(10, precision);
    v = Math.round(v * f) / f;
    return v;
  }
})
.service('$clamp', function ($isNumber, $round) {
  return function  (v, min, max, precision) {
    if (!$isNumber(v)) { return NaN; }
    if ($isNumber(min)) { v = Math.max(v, min); }
    if ($isNumber(max)) { v = Math.min(v, max); }
    if ($isNumber(precision)) { v = $round(v, precision); }
    return v;
  }
})
.service('$shuffle', function ($isArray) {
  return function (array) { // performs a shuffle in place
    if(!$isArray(array)) {
      return false;
    }

    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
})
.service('$shuffledCopy', function ($isArray, $shuffle) {
  return function (array) {
    if(!$isArray(array)) {
      return false;
    }
    return $shuffle(array.slice());
  }
})
.service('$random', function ($asNumber, $isNumber, $round) {
  return function (min, max, precision) {
    min = $asNumber(min, 0);
    max = $asNumber(max, 1);

    var
    v = min + (Math.random() * (max - min));

    if ($isNumber(precision)) {
      v = $round(v, precision);
    }

    return v;
  }
})
.service('$randomPluck', function ($isArray, $clamp, $random, $asNumber, $shuffledCopy) {
  return function (array, items, alwaysArray) {
    if(!$isArray(array)) {
      return false;
    }

    items = $clamp($asNumber(items, 1), 1);

    if(items === 1 && !alwaysArray) {
      return array[Math.floor($random(0, array.length))];
    }
    else {
      return $shuffledCopy(array).slice(0, items);
    }
  }
})
.service('$uuid', function () {
  var nonce = 1;
  return function () {
    return nonce++;
  };
});
