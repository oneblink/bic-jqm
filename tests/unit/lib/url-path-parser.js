define(['jquery', 'Squire', 'chai'], function ($, Squire, chai) {
  'use strict';

  var CONTEXT = 'tests/unit/lib/url-path-parser.js';

  describe('urlPathParser', function () {
    var injector;
    var urlPathParser;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      injector.require(['bic/lib/url-path-parser'], function (upp) {
        urlPathParser = upp;

        done();
      });
    });

    after(function () {
      injector.remove();
    });

    function makeTests (urlPrefix) {
      return function () {
        it('should return an empty array', function () {
          var result = urlPathParser(urlPrefix);
          assert.isArray(result);
          assert.lengthOf(result, 0);
        });

        it('should return the path as an array that has been reversed', function () {
          var result = urlPathParser(urlPrefix + 'first/second/third/fourth');
          assert.isArray(result);
          assert.lengthOf(result, 4);
          assert.strictEqual(result[0], 'fourth');
          assert.strictEqual(result[1], 'third');
          assert.strictEqual(result[2], 'second');
          assert.strictEqual(result[3], 'first');
        });

        it('should ignore the trailing slash', function () {
          var result = urlPathParser(urlPrefix + 'first/second/third/fourth/');
          assert.isArray(result);
          assert.lengthOf(result, 4);
          assert.strictEqual(result[0], 'fourth');
          assert.strictEqual(result[1], 'third');
          assert.strictEqual(result[2], 'second');
          assert.strictEqual(result[3], 'first');
        });
      };
    }

    describe('browser url paths', makeTests('/'));

    describe('cordova url paths', function () {

      /*
        Cordova prefixes taken from
        https://github.com/apache/cordova-plugin-file
        https://msdn.microsoft.com/en-us/library/windows/apps/hh781215.aspx
      */

      describe('on Android', makeTests('file:///android_asset/www/index.html/'));

      describe('on Windows', makeTests('ms-appx:///com.blinkmobile/www/index.html/'));

      describe('on iOS', makeTests('file:///var/mobile/Applications/98004d20-b068-4b84-8e2e-4000555c0dd6/blinkmobile/www/index.html/'));
    });
  });
});
