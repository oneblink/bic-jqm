/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('wrapper-backbone', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone;
});

define('model-application-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define('model-form-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define('interaction.mustache', ['backbone'], function (Backbone) {
  "use strict";
  return "String";
});

define('view-interaction-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.View.extend();
});

define('collection-interactions-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Collection.extend();
});

define('jquerymobile', [], function () {
  "use strict";
  console.log("Subtituting jQuery Mobile");
});

define('BlinkForms', [], function () {
  "use strict";
  return {};
});

define('text!template-interaction.mustache', [], function () {
  "use strict";
  return "string";
});

define('text!template-inputPrompt.mustache', [], function () {
  "use strict";
  return "string";
});

define('text!template-form.mustache', [], function () {
  "use strict";
  return "string";
});

define(['../../scripts/view-interaction-mobile.js', 'backbone', 'jquery'],
  function (View, Backbone, $) {
    "use strict";
    describe('View - Interaction - jQuery Mobile Implementation', function () {
      it("should exist", function () {
        should.exist(View);
      });

      it("should be a Backbone.View object constructor", function () {
        View.should.be.an.instanceOf(Function);
      });

      describe('DOM Manipulations', function () {
        it('should add a div to the DOM', function () {
          var divsBefore, divsAfter, difference, view;
          divsBefore = $('body > div').length;
          view = new View({});
          divsAfter = $('body > div').length;
          difference = divsAfter - divsBefore;
          difference.should.equal(1);
        });
        it('should add the attribute data-role="page" to the div');
      });

      describe('Content Rendering', function () {
        it('should add a global theme element');
        it('should render an input prompt screen');
        it('should render custom input prompt screens');
        it('should render XSLT interactions');
        it('should render Form interactions');
        it('should render General interactions');
        it('should trigger a render event');
      });

      describe('Navigation Handling', function () {
        it('should handle requests to go back');
      });

      describe('BlinkLink Handling', function () {
        it('should handle <a keyword=""> link format');
        it('should handle <a interaction=""> link format');
        it('should handle <a category=""> link format');
        it('should handle <a masterCategory=""> link format');
        it('should handle <a home> link format');
        it('should handle <a login> link format');
      });

      describe('Form Handling', function () {
        it('should handle submit actions');
        it('should handle cancel actions');
        it('should handle save actions');
        it('should handle pending queue actions');
      });

      describe('Google Maps', function () {
        it('should handle Basic type maps');
        it('should handle Address type maps');
        it('should handle Direction type maps');
        it('should handle KML type maps');
      });

      describe('Control Messages', function () {
        it('should handle data suitcase add commands');
        it('should handle data suitcase remove commands');
        it('should handle star add commands');
        it('should handle star remove commands');
        it('should handle star clear commands');
        it('should handle multiple commands in one interaction');
      });
    });
  });
