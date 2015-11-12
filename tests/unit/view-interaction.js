define([
  'Squire', 'jquery', 'jquerymobile', 'chai', 'backbone'
], function (Squire, $, $mobile, chai, Backbone) {
  'use strict';

  var CONTEXT = 'tests/unit/view/interaction.js';
  var should = chai.should();

  describe('View - Interaction - jQuery Mobile Implementation', function () {
    var injector, View;
    var mockApp, mockPending;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('jquery', $);
      injector.mock('jquerymobile', $mobile);

      mockApp = new Backbone.Model();
      mockPending = new Backbone.Model();
      mockApp.views = {
        FormPending: null
      };

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('backbone', Backbone);

      injector.mock('bic/model/application', mockApp);
      injector.mock('bic/view/form/pending', mockPending);
      injector.mock('bic/model/star', function () { return null; });
      injector.mock('bic/view/star', function () { return null; });
      injector.mock('bic/view/form', function () { return null; });
      injector.mock('text!bic/template/interaction.mustache', 'string');
      injector.mock('text!bic/template/inputPrompt.mustache', 'string');
      injector.mock('text!bic/template/category-list.mustache', 'string');
      //NOTE: Some tests still depend on actual popup template, so not using following line
      //injector.mock('text!bic/template/popup.mustache', 'string');

      injector.require(['bic/view/interaction'], function (required) {
        View = required;
        done();
      });
    });

    after(function () {
      injector.remove();
    });

    it('should exist', function () {
      should.exist(View);
    });

    it('should be a Backbone.View object constructor', function () {
      View.should.be.an.instanceOf(Function);
    });

    describe('preparePendingQueueSubView', function () {
      it('functions on view', function () {
        assert(mockPending === View.preparePendingQueueSubView(), '1');
        mockApp.views.FormPending = new Backbone.Model();
        assert(mockApp.views.FormPending === View.preparePendingQueueSubView(), '2');
        assert(mockPending !== View.preparePendingQueueSubView(), '3');
      });
    });

    describe('view = new View({})', function () {
      var view;

      before(function () {
        view = new View({});
      });

      after(function () {
        view.destroy();
        view.$el.remove();
        view = null;
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

      describe('view.popup()', function () {
        it('is a function', function () {
          assert.isFunction(view.popup);
        });

        it('creates a #popup element', function () {
          var popup$;
          var text = 'hello, popup!';
          view.popup(text);
          popup$ = $('#popup');
          assert.lengthOf(popup$, 1);
          assert.equal(popup$.text().trim(), text);
        });

        it('#popup element is gone after close', function (done) {
          var popup$;
          popup$ = $('#popup');
          popup$.popup('close');
          setTimeout(function () {
            popup$ = $('#popup');
            assert.lengthOf(popup$, 0);
            done();
          }, 1e3);
        });
      });
    });

    describe('events', function () {
      var view;

      before(function () {
        view = new View({});
      });

      after(function () {
        view.destroy();
        view.$el.remove();
        view = null;
      });

      it('should handle click [keyword]');
      it('should handle click [interaction]');
      it('should handle click [category]');
      it('should handle click [masterCategory]');
      it('should handle click [back]');
      it('should handle click [home]');
      it('should handle click [login]');

      it('should listen for route:beforechange to clean up events but the element should be left in the DOM for jqm to clean up', function () {
        var initialNumListeners = Object.keys(view._listeningTo).length;
        Backbone.trigger('route:beforechange');
        assert.isBelow(Object.keys(view._listeningTo || {}).length, initialNumListeners);
        assert.isTrue($.contains(document, view.el));
      });
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

  describe('BMP.geolocation', function () {
    it('should exist', function () {
      should.exist(BMP.geolocation);
    });
  });

  describe('BMP.BIC.getCurrentPosition', function () {
    it('should exist', function () {
      should.exist(BMP.BIC.getCurrentPosition);
    });
  });
});
