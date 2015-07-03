define(['Squire', 'backbone'], function (Squire, Backbone) {
  'use strict';

  var CONTEXT = 'tests/unit/view-error-summary-list.js';

  describe('View - Form Error Summary ', function () {
    var injector, View;
    var mockApp;
    var mockForms;
    var formActionView;

    beforeEach(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      mockApp = new (Backbone.Model.extend({
          getInvalidElements: function(){ return [1, 2, 3]; }
        }))();

      mockForms = {
        current: {
          getInvalidElements: function(){ return [1, 2, 3]; }
        }
      };

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('backbone', Backbone);

      injector.mock('BlinkForms', mockForms);
      injector.mock('bic/model-application', mockApp);
      injector.require(['bic/view-form-error-summary-list-view'], function (required) {
        View = required;

        formActionView = new View({model: mockApp});
        done();
      });
    });

    afterEach(function () {
      injector.remove();
      formActionView = null;
      View = null;
    });

    it('should exist', function () {
      should.exist(View);
    });

    it('should be a Backbone.View object constructor', function () {
      View.should.be.an.instanceOf(Function);
    });

    describe('standard behavior', function(){
      it('should default to 4 errors', function(){
        assert.equal(formActionView.getLimit(), 4);
      });

      it('should set the number of errors correctly', function(){
        formActionView.showAll();
        assert.equal(formActionView.getLimit(), 0);
        formActionView.showLess();
        assert.equal(formActionView.getLimit(), 4);
      });
    });

    describe('modified static properties', function(){
      beforeEach(function(){
        View.limit = 10;

        View.template = function(){
          return "<li id='test'>modified</li>";
        };
      });

      it('should default to 4 errors', function(){
        assert.equal(formActionView.getLimit(), 10);
      });

      it('should set the number of errors correctly', function(){
        formActionView.showAll();
        assert.equal(formActionView.getLimit(), 0);
        formActionView.showLess();
        assert.equal(formActionView.getLimit(), 10);
      });

      it('should use the modified template', function(){
        assert.equal(formActionView.render().$el.find('#test').text(), 'modified');
      });
    });

  });

});
