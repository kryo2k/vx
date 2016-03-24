angular.module('coordinate-vx')
.filter('ellipsis', function () {
  return function (str, lenStart, lenEnd, threshold, ellip) {
    var
    lenEllip = 0,
    lenInter = 0,
    lenStr = 0;

    if(!str) { return ''; }
    if(!angular.isString(str)) {
      str = String(str);
    }

    lenStr    = str.length;
    ellip     = angular.isString(ellip) ? ellip : '...';
    lenEllip  = ellip.length;
    lenStart  = (!angular.isNumber(lenStart) || lenStart  < 0) ? 5 : lenStart;
    lenEnd    = (!angular.isNumber(lenEnd)   || lenEnd    < 0) ? 5 : lenEnd;
    lenInter  =  (lenStart + lenEnd + lenEllip);
    threshold = (!angular.isNumber(threshold) || threshold < lenInter)
      ? lenInter : threshold;

    return (lenStr < threshold)
      ? str
      : str.substring(0, lenStart) + ellip + str.substring(lenStr - lenEnd, lenStr);
  };
});
