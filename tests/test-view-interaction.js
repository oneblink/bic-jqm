define(['Squire'], function (Squire) {
  'use strict';
  describe('View - Interaction - jQuery Mobile Implementation', function () {
    var injector, View;

    before(function (done) {
      injector = new Squire();

      injector.mock('model-application', function () { return null; });
      injector.mock('model-star', function () { return null; });
      injector.mock('view-star', function () { return null; });
      injector.mock('view-form', function () { return null; });
      injector.mock('text!template-interaction.mustache', 'string');
      injector.mock('text!template-inputPrompt.mustache', 'string');
      injector.mock('text!template-form.mustache', 'string');
      injector.mock('text!template-category-list.mustache', 'string');
      injector.mock('text!template-pending.mustache', 'string');
      injector.mock('text!template-popup.mustache', 'string');
      injector.mock('text!template-clear-confirmation-popup.mustache', 'string');

      injector.require(['../scripts/view-interaction'], function (required) {
        View = required;
        done();
      });
    });

    it('should exist', function () {
      should.exist(View);
    });

    it('should be a Backbone.View object constructor', function () {
      View.should.be.an.instanceOf(Function);
    });

    describe('view = new View({})', function () {
      var view;

      before(function () {
        view = new View({});
      });

      it('should have a home method', function () {
        expect(view.home).to.be.an.instanceOf(Function);
      });

      it('should be accessible as BMP.BIC.view', function () {
        should.exist(window.BMP);
        should.exist(BMP.BIC);
        should.exist(BMP.BIC.view);
        expect(BMP.BIC.view).to.equal(view);
      });
    });

    describe('events', function () {
      it('should handle click [keyword]');
      it('should handle click [interaction]');
      it('should handle click [category]');
      it('should handle click [masterCategory]');
      it('should handle click [back]');
      it('should handle click [home]');
      it('should handle click [login]');
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
      it('should render the Home Screen');
      it('should render Category interactions');
      it('should render Message interactions');
      it('should render Other interaction types');
      it('should trigger a render event');
      it('should return the current view');
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
