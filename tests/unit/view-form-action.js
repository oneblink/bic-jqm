define(['Squire', 'backbone', 'chai'], function (Squire, Backbone, chai) {
  'use strict';

  var CONTEXT = 'tests/unit/view/form/action.js';
  var should = chai.should();

  describe('View - Form Actions ', function () {
    var injector, View;
    var mockApp;
    var mockControls;
    var MockErrorSummaryViewConstructor;
    var mockForms;

    beforeEach(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      mockApp = new Backbone.Model();
      mockControls = new Backbone.Model();
      MockErrorSummaryViewConstructor = Backbone.View.extend({
        test: function () { return 'it worked'; },
        enhance: function () { return this; }
      });
      mockForms = {
        current: {
          getInvalidElements: function () {}
        }
      };

      mockApp.views = {
        FormControls: null
      };

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('backbone', Backbone);

      injector.mock('BlinkForms', mockForms);
      injector.mock('bic/model/application', mockApp);
      injector.mock('bic/view/form/controls', mockControls);
      injector.mock('bic/view/form/error-summary-list', MockErrorSummaryViewConstructor);
      injector.require(['bic/view/form/action'], function (required) {
        View = required;
        done();
      });
    });

    afterEach(function () {
      injector.remove();
    });

    it('should exist', function () {
      should.exist(View);
    });

    it('should be a Backbone.View object constructor', function () {
      View.should.be.an.instanceOf(Function);
    });

    describe('prepareSubView', function () {
      it('functions on view', function () {
        assert(mockControls === View.prepareSubView());
        mockApp.views.FormControls = new Backbone.Model();
        assert(mockApp.views.FormControls === View.prepareSubView());
        assert(mockControls !== View.prepareSubView());
      });
    });

    describe('renderErrorSummary', function () {
      var formActionView;

      beforeEach(function () {
        formActionView = new View({model: mockApp});
        mockApp.set('displayErrorSummary', true);
        mockApp.views.FormErrorSummary = null;
      });

      afterEach(function () {
        formActionView = null;
        //injector.remove();
      });

      it('should render the default error summary view', function () {
        assert.equal(formActionView.renderErrorSummary().test(), 'it worked');
      });

      it('should not render the default error summary view', function () {
        mockApp.views.FormErrorSummary = Backbone.View.extend({
          test: function () { return 'it is overridden'; }
        });

        assert.equal(formActionView.renderErrorSummary().test(), 'it is overridden');
      });
    });

  });

});
