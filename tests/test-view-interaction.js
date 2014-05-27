define(['Squire'], function (Squire) {
  "use strict";
  describe('View - Interaction - jQuery Mobile Implementation', function () {
    var injector, View;

    before(function (done) {
      injector = new Squire();

      injector.mock('model-application', function (param) {console.log(param)});
      injector.mock('model-star', function (param) {console.log(param)});
      injector.mock('view-star', function (param) {console.log(param)});

      injector.require(['../bower_components/requirejs-text/text'], function (text) {
        injector.require(['../scripts/view-interaction'], function (required) {
          View = required;
          done();
        });
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
