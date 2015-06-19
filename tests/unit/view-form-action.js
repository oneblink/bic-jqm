define(['Squire', 'backbone'], function (Squire, Backbone) {
  'use strict';

  var CONTEXT = 'tests/unit/view-form-action.js';

  describe('View - Form Actions ', function () {
    var injector, View;
    var mockApp;
    var mockControls;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      mockApp = new Backbone.Model();
      mockControls = new Backbone.Model();

      mockApp.views = {
        FormControls: null
      };

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('backbone', Backbone);

      injector.mock('bic/model-application', mockApp);
      injector.mock('bic/view-form-controls', mockControls);
      injector.require(['bic/view-form-action'], function (required) {
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

    describe('prepareSubView', function () {
      it('functions on view', function () {
        assert(mockControls === View.prepareSubView());
        mockApp.views.FormControls = new Backbone.Model();
        assert(mockApp.views.FormControls === View.prepareSubView());
        assert(mockControls !== View.prepareSubView());
      });
    });

  });

});
