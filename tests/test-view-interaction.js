/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
// define('wrapper-backbone', [], function () {
//   "use strict";
//   return Backbone;
// });

// define('model-application-mobile', [], function () {
//   "use strict";
//   return Backbone.Model.extend();
// });

// define('model-form-mobile', [], function () {
//   "use strict";
//   return Backbone.Model.extend();
// });

// define('model-star-mobile', [], function () {
//   "use strict";
//   return Backbone.Model.extend();
// });

// define('interaction.mustache', [], function () {
//   "use strict";
//   return "String";
// });

// define('view-interaction-mobile', [], function () {
//   "use strict";
//   return Backbone.View.extend();
// });

// define('view-star-mobile', [], function () {
//   "use strict";
//   return Backbone.View.extend();
// });

// define('collection-interactions-mobile', [], function () {
//   "use strict";
//   return Backbone.Collection.extend();
// });

// define('jquerymobile', [], function () {
//   "use strict";
//   console.log("Subtituting jQuery Mobile");
// });

// define('BlinkForms', [], function () {
//   "use strict";
//   return {};
// });

// define('text!template-interaction.mustache', [], function () {
//   "use strict";
//   return "string";
// });

// define('text!template-inputPrompt.mustache', [], function () {
//   "use strict";
//   return "string";
// });

// define('text!template-form.mustache', [], function () {
//   "use strict";
//   return "string";
// });

// define('text!template-category-list.mustache', [], function () {
//   "use strict";
//   return "string";
// });

// define('text!template-pending-mobile.mustache', [], function () {
//   "use strict";
//   return "string";
// });

define(function () {
  "use strict";
  describe('View - Interaction - jQuery Mobile Implementation', function () {
    var View, originalApp, originalStarM, originalStarV;

    before(function (done) {
      require(['model-application', 'model-star', 'view-star'], function (app, StarModel, StarView) {

        originalApp = app;
        originalStarM = StarModel;
        originalStarV = StarView;
        requirejs.undef('model-application');
        requirejs.undef('model-star');
        requirejs.undef('view-star');

        define('model-application', [], function () {
          return function (param) {console.log(param)};
        });

        define('model-star', [], function () {
          return function (param) {console.log(param)};
        });

        define('model-view', [], function () {
          return function (param) {console.log(param)};
        });

        require(['view-interaction'], function (rView) {
          View = rView;
          done();
        });
      });
    });

    after(function () {
      requirejs.undef('model-application');
      requirejs.undef('model-star');
      requirejs.undef('view-star');
      
      define('model-application', ['collection-interactions', 'collection-datasuitcases', 'collection-forms', 'collection-pending', 'feature!data', 'api', 'collection-stars'], function (InteractionCollection, DataSuitcaseCollection, FormCollection, PendingCollection, Data, API, StarsCollection) {
        return originalApp;
      });

      define('model-star', [], function () {
        return originalStarM;
      });

      define('model-view', [], function () {
        return originalStarV;
      });
    });

    it("should exist", function () {
      should.exist(View);
    });

    it("should be a Backbone.View object constructor", function () {
      View.should.be.an.instanceOf(Function);
    });

    describe('initialize()', function () {
      it('should add a div to the DOM', function () {
        var divsBefore, divsAfter, difference, view;
        divsBefore = $('body > div').length;
        view = new View({});
        divsAfter = $('body > div').length;
        difference = divsAfter - divsBefore;
        difference.should.equal(1);
      });
    });

    describe('events', function () {
      it("should handle click [keyword]");
      it("should handle click [interaction]");
      it("should handle click [category]");
      it("should handle click [masterCategory]");
      it("should handle click [back]");
      it("should handle click [home]");
      it("should handle click [login]");
    });

    describe('attributes', function () {
      it('should add the attribute data-role="page" to the div');
    });

    describe('blinklink()', function () {
      it('should handle <a keyword=""> link format');
      it('should handle <a interaction=""> link format');
      it('should handle <a category=""> link format');
      it('should handle <a masterCategory=""> link format');
      it('should handle <a home> link format');
      it('should handle <a login> link format');
    });

    describe('render(data)', function () {
      it('should add a theme swatch if needed');
      it('should render an input prompt screen');
      it('should render custom input prompt screens');
      it('should render XSLT interactions');
      it('should render Form interactions');
      it("should render the Home Screen");
      it("should render Category interactions");
      it("should render Message interactions");
      it('should render Other interaction types');
      it('should trigger a render event');
      it("should return the current view");
    });

    describe('maps()', function () {
      it('should handle Basic type maps');
      it('should handle Address type maps');
      it('should handle Direction type maps');
      it('should handle KML type maps');
    });

    describe('blinkAnswerMessages(message)', function () {
      it('should handle data suitcase add commands');
      it('should handle data suitcase remove commands');
      it('should handle star add commands');
      it('should handle star remove commands');
      it('should handle star clear commands');
      it('should handle multiple commands in one interaction');
    });

    describe('formSubmit()', function () {
      it('should add the form to the pending queue');
      it('should mark the pending item for submission');
      it('should trigger the pending queue to start processing items');
    });

    describe('formCancel()', function () {
      it('should remove the form from the pending queue, if present');
      it('should trigger the pending queue to start processing items');
    });

    describe('formSave()', function () {
      it('should add the form to the pending queue');
      it('should mark the pending item to not be submitted');
      it('should trigger the pending queue to start processing items');
    });

    describe('pendingQueue()', function () {
      it('should display the current pending items to the user');
    });

    describe('destroy()', function () {
      it('should remove all bindings to the view');
      it('should remove the view from the DOM');
    });

    describe('processStars', function () {
      it('should find any starrable items in current view');
      it('should find any existing star models for that item');
      it('should create a star model for every other item');
      it('should fill the star model with the star data');
      it('should create a view for each star model');
    });
  });
});
