'use strict';

var
defResults = 10,
maxResults = 100;

exports.page = function (query) {
  return Math.max(query.page||1,1);
};

exports.offset = function (query) {
  return Math.max(Math.min(query.limit||defResults, maxResults), 0);
};