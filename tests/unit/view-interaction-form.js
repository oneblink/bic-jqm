define([
  'Squire', 'jquery', 'jquerymobile', 'chai', 'backbone'
], function (Squire, $, $mobile, chai, Backbone) {
  'use strict';

  var CONTEXT = 'tests/unit/view/interaction-form.js';
  var assert = chai.assert;

  describe('FormInteractionView - jQuery Mobile Implementation', function () {
    var injector, View;
    var FormView, FormActionView, FormControlsView;
    var Forms;
    var mockApp, mockForms, interactionModel;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('jquery', $);
      injector.mock('jquerymobile', $mobile);
      injector.mock('backbone', Backbone);

      mockApp = new Backbone.Model();
      mockApp.views = {};
      mockApp.hasStorage = function () { return false; };
      injector.mock('bic/model/application', mockApp);

      mockForms = {
        initialize: function () {
          var formModel = new Backbone.Model({ pages: new Backbone.Collection() });
          this.current = formModel;
          return formModel;
        },
        getDefinition: function () {
          return Promise.resolve({ default: { name: 'test' } });
        }
      };
      injector.mock('BlinkForms', mockForms);
      injector.mock('bic/promise-forms', function () {
        return Promise.resolve(mockForms);
      });

      interactionModel = new Backbone.Model({
        blinkFormObjectName: 'test',
        blinkFormAction: 'add'
      });
      interactionModel.getArgument = function () { return null; };
      interactionModel.inherit = function () {
        return this.attributes;
      };

      injector.require([
        'BlinkForms',
        'bic/view/interaction/form',
        'bic/view/form',
        'bic/view/form/action',
        'bic/view/form/controls'
      ], function (F, FIV, FV, FAV, FCV) {
        Forms = F;
        View = FIV;
        FormView = FV;
        FormActionView = FAV;
        FormControlsView = FCV;
        done();
      });
    });

    after(function () {
      injector.remove();
    });

    it('should be a Backbone.View object constructor', function () {
      var view;
      assert(View);
      assert.isFunction(View);
      view = new View({ model: interactionModel });
      assert.instanceOf(view, View);
      assert.instanceOf(view, Backbone.View);
      assert.equal(view.model, interactionModel);
    });

    describe('constructed with a Model, then #render()', function () {
      var view;

      before(function (done) {
        view = new View({ model: interactionModel });
        view.once('render', done);
        view.render();
      });

      it('has a "bic/view/form" subView', function () {
        var subView = view.subView;
        assert(subView);
        assert.instanceOf(subView, FormView);
        assert.equal(subView.model, interactionModel, 'sharing the same model');
      });

      it('has a "bic/view/form/action" subView.subView', function () {
        var subView = view.subView.subView;
        assert(subView);
        assert.instanceOf(subView, FormActionView);
        assert.equal(subView.model, interactionModel, 'sharing the same model');
      });

      it('has a "bic/view/form/controls" subView.subView.subView', function () {
        var subView = view.subView.subView.subView;
        assert(subView);
        assert.instanceOf(subView, FormControlsView);
        assert.equal(subView.model, interactionModel, 'sharing the same model');
      });

      it('establishes Forms.current === model.attributes.currentForm', function () {
        assert.instanceOf(Forms.current, Backbone.Model);
        assert.equal(Forms.current, view.model.attributes.currentForm);
      });
    });
  });
});
