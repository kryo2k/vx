var
_ = require('lodash');

module.exports = function (str, lenStart, lenEnd, threshold, ellip) {
  var
  lenEllip = 0,
  lenInter = 0,
  lenStr = 0;

  if(!str) { return ''; }
  if(!_.isString(str)) {
    str = String(str);
  }

  lenStr    = str.length;
  ellip     = _.isString(ellip) ? ellip : '...';
  lenEllip  = ellip.length;
  lenStart  = (!_.isNumber(lenStart) || lenStart  < 0) ? 5 : lenStart;
  lenEnd    = (!_.isNumber(lenEnd)   || lenEnd    < 0) ? 5 : lenEnd;
  lenInter  =  (lenStart + lenEnd + lenEllip);
  threshold = (!_.isNumber(threshold) || threshold < lenInter)
    ? lenInter : threshold;

  return (lenStr < threshold)
    ? str
    : str.substring(0, lenStart) + ellip + str.substring(lenStr - lenEnd, lenStr);
};
