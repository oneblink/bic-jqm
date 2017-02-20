define([
  'backbone', 'jquery', 'bic/lib/links'
], function (Backbone, $, links) {
  'use strict';

  describe('bic/lib/links', function () {
    describe('destinationFromElement()', function () {
      var mockApp;

      beforeEach(function () {
        mockApp = new Backbone.Model({
          siteName: 'test'
        });
      });

      it('returns null when $element has no navigation attributes', function () {
        var $element = $('<a />');
        var result = links.destinationFromElement($element, mockApp);
        assert.equal(result, null);
      });

      it('extracts [interaction] attribute from $element', function () {
        var $element = $('<a interaction="abc" />');
        var result = links.destinationFromElement($element, mockApp);
        assert.equal(result, 'abc');
      });

      it('returns siteName when $element has [home] attribute', function () {
        var $element = $('<a home />');
        var result = links.destinationFromElement($element, mockApp);
        assert.equal(result, 'test');
      });

      it('returns loginPromptInteraction when $element has [login] attribute', function () {
        var $element = $('<a login />');
        var result;

        mockApp.set('loginAccess', true);
        mockApp.set('loginUseInteractions', true);
        mockApp.set('loginPromptInteraction', 'login');

        result = links.destinationFromElement($element, mockApp);
        assert.equal(result, 'login');
      });

      it('returns siteName when $element has [login] attribute but no loginAccess', function () {
        var $element = $('<a login />');
        var result;

        mockApp.set('loginAccess', null);
        mockApp.set('loginUseInteractions', true);
        mockApp.set('loginPromptInteraction', 'login');

        result = links.destinationFromElement($element, mockApp);
        assert.equal(result, 'test');
      });
    });

    describe('nextPagePath()', function () {
      var mockApp;

      beforeEach(function () {
        mockApp = new Backbone.Model({
          siteName: 'test'
        });
        mockApp.interactions = new Backbone.Collection([
          new Backbone.Model({ id: 'abc', type: 'message' }),
          new Backbone.Model({ id: 'def', type: 'message' }),
          new Backbone.Model({ id: 'ghi', type: 'message' }),
          new Backbone.Model({ id: 'test' }) // siteName must be represented
        ]);
      });

      it('returns /siteName if empty location and destination', function () {
        var result = links.nextPagePath('', '', mockApp);
        assert.equal(result, '/test');
      });

      it('appends destination to location', function () {
        var result = links.nextPagePath('/test/abc', 'def', mockApp);
        assert.equal(result, '/test/abc/def');
      });

      it('de-duplicates path segments, favouring right-most occurrences', function () {
        var result = links.nextPagePath('/test/abc/def', 'abc', mockApp);
        assert.equal(result, '/test/def/abc');
      });

      it('de-duplicates path segments, keeping site-root left-most', function () {
        var result = links.nextPagePath('/test/abc/test', 'def', mockApp);
        assert.equal(result, '/test/abc/def');
      });

      it('drops invalid / unknown / empty path segments', function () {
        var result = links.nextPagePath('/test//def/jkl', 'mno', mockApp);
        assert.equal(result, '/test/def');
      });
    });
  });
});
