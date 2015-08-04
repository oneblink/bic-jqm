'use strict';

// Node.js built-ins

var fs = require('fs');
var path = require('path');

// 3rd-party modules

var AppCache = require('@jokeyrhyme/appcache');
var Mustache = require('mustache');

var test = require('tape');

// this module

var projectPath = path.join(__dirname, '..', '..');
var pkg = require(path.join(projectPath, 'package.json'));

var appCache;
var config;

test('AppCache', function (t) {

  t.test('is correctly formatted', function (tt) {
    var filePath = path.join(projectPath, 'src', 'buildFiles', 'templates', 'appcache.mustache');
    var template = fs.readFileSync(filePath, { encoding: 'utf8' });
    var contents;
    tt.ok(template);
    tt.isString(template);
    contents = Mustache.render(template, { forms: pkg.formsversion });
    appCache = AppCache.parse(contents);
    tt.ok(appCache);
    tt.end();
  });

  t.test('has correct number of CACHE items', function (tt) {
    tt.isArray(appCache.cache);
    tt.equal(appCache.cache.length, 34);
    tt.end();
  });

  t.end();
});

test('runtime Require.js configuration', function (t) {

  t.test('sets "paths"', function (tt) {
    config = require(path.join(projectPath, 'src', 'frag', '00-config'));

    tt.isObject(config.paths);
    tt.end();
  });

  t.end();
});

test('AppCache vs Require.js', function (t) {

  t.test('every Require.js CDN path is in the AppCache', function (tt) {
    var paths = Object.keys(config.paths).map(function (id) {
      return config.paths[id][1]; // this is the /_c_/ path from frag/00-config.js
    });
    paths.forEach(function (requirePath) {
      requirePath += '.js';
      tt.include(appCache.cache, requirePath, requirePath);
    });
    tt.end();
  });

  t.end();
});
