/*eslint-env node*/

/*eslint-disable camelcase*/ // need to match existing data structure

'use strict';

// Node.js built-ins

var fs = require('fs');
var path = require('path');

// 3rd-party modules

var request = require('request');

// this module

var bicVersion = (function () {
  var templatePath = path.join(__dirname, '..', '..', 'src', 'buildFiles', 'templates', 'versions.json');
  var contents = fs.readFileSync(templatePath, { encoding: 'utf8' });
  contents = contents.replace(/\r/g, '').split('\n\n\n').filter(function (section) {
    return !!section;
  });
  return JSON.parse(contents[1].trim());
}());

function getScriptsHTML (bic, config) {
  var html = bic.scripts.reduce(function (prev, current) {
    var href = '//d1c6dfkb81l78v.cloudfront.net/' + current;
    if (current.indexOf('bic.min.js') !== -1) {
      return prev + '<script src="/bic.js"></script>';
    }
    return prev + '<script src="' + href + '"></script>';
  }, '');

  if (config && config.pertinent && config.pertinent.externalJavaScript) {
    html += config.pertinent.externalJavaScript;
  }

  return html;
}

module.exports = function (BMP_HOST, req, callback) {
  var search = req.path.replace(/^\//, '');
  var searchParts = search.split('/');
  var answerSpace = searchParts[0];

  request('http://' + BMP_HOST + '/_R_/common/3/xhr/GetConfig.php?_asn=' + answerSpace, {
    json: true
  }, function (err, res, body) {
    var spaces;
    var answerSpaceId;
    if (err) { throw err; }
    spaces = Object.keys(body).filter(function (key) {
      return key[0] === 'a';
    });
    answerSpaceId = parseInt(spaces[0].replace('a', ''), 10);

    callback(null, {
      _SERVER: request.headers,
      _SESSION: {
        "HTTP_USER_AGENT": req.headers["user-agent"]
      },
      answerSpace: {
        id: answerSpaceId,
        name: answerSpace,
        displayName: answerSpace,
        env: {},
        env_json: '{}',
        styleSheets_html: bicVersion.styleSheets.theme.reduce(function (prev, current) {
          var href = '//d1c6dfkb81l78v.cloudfront.net/' + current;
          return prev + '<link rel="stylesheet" href="' + href + '" />';
        }, ''),
        scripts_html: getScriptsHTML(bicVersion, body['a' + answerSpaceId]),
        styleSheet: '',
        appCache: '',
        appCachePermalink: '/appcache.manifest?answerSpace=' + answerSpace
      },

      BIC: bicVersion
    });
  });
};
