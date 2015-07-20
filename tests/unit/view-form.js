define(['Squire', 'backbone', 'chai'], function (Squire, Backbone, chai) {
  'use strict';

  var CONTEXT = 'tests/unit/view/form.js';
  var should = chai.should();

  describe('View - Form', function () {
    var injector, View;
    var mockApp;
    var mockList;
    var mockAction;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      mockApp = new Backbone.Model();
      mockList = new Backbone.Model();
      mockAction = new Backbone.Model();

      mockApp.views = {
        FormControls: null,
        FormList: null
      };

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('backbone', Backbone);

      injector.mock('bic/model-application', mockApp);
      injector.mock('bic/view/form/action', mockAction);
      injector.mock('bic/view/form/list', mockList);
      injector.require(['bic/view/form'], function (required) {
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
        assert(mockList === View.prepareSubView());
        mockApp.views.FormList = new Backbone.Model();
        assert(mockApp.views.FormList === View.prepareSubView());
        assert(mockList !== View.prepareSubView());
      });
    });

  });

});
