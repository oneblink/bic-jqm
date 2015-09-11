define(function (require) {
  'use strict';

  var _ = require('underscore');

  function parseCordova (path) {
    var match = /www\/index\.html\/?(.*)/.exec(path);

    return match ? match[1] : false;
  }

  function parseUrlPath (path) {
    var cordovaPath = parseCordova(path);
    var match = cordovaPath !== false ? cordovaPath : path.substr(1).toLowerCase();

    return _.compact(match.split('/')).reverse();
  }

  return parseUrlPath;
});
