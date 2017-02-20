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
  });
});
