/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
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

define('text!interaction.mustache', [], function () {
  "use strict";
  return "string";
});

define('text!inputPrompt.mustache', [], function () {
  "use strict";
  return "string";
});

//Backbone, app, InteractionModel, InteractionView, $
define(['../../scripts/view-interaction-mobile.js', 'backbone'],
  function (view, Backbone) {
    "use strict";
    describe('View - Interaction - jQuery Mobile Implementation', function () {
      it("should exist", function () {
        should.exist(view);
      });

      it("should be a Backbone.View object constructor", function () {
        view.should.be.an.instanceOf(Function);
      });

      describe('BlinkLink Handling', function () {
        it('should handle <a keyword=""> link format');
        it('should handle <a interaction=""> link format');
        it('should handle <a category=""> link format');
        it('should handle <a masterCategory=""> link format');
        it('should handle <a home> link format');
        it('should handle <a login> link format');
      });
    });
  });
