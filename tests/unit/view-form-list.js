define([
  'Squire', 'backbone', 'chai', 'underscore', 'jquery'
], function (Squire, Backbone, chai, _, $) {
  'use strict';

  var CONTEXT = 'tests/unit/view/form/list.js';
  var assert = chai.assert;

  var DEFINITIONS = {
    lowercase: {
      _elements: [
        { name: 'field1', type: 'text' }
      ]
    },
    TitleCase: {
      _elements: [
        { name: 'Field1', type: 'text' }
      ]
    }
  };

  var mockApp = {
    formRecords: _.extend([
      new Backbone.Model({ id: '1', list: { field1: 'abcdef' } }),
      new Backbone.Model({ id: '2', list: { field1: 'ghijkl' } })
    ], {
      pull: function () {
        return Promise.resolve();
      }
    }),
    interactions: {
      getFormActions: function () {
        return {
          delete: '1',
          edit: '2',
          view: '3'
        };
      }
    }
  };

  var mockForms = {};

  var mockModel = { get: function () { return ''; } };

  describe('View - Form List ', function () {
    var injector, View, oldForms, fixture$;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      oldForms = window.BMP.Forms;
      window.BMP.Forms = mockForms;

      fixture$ = $('<div id="' + CONTEXT + '"></div>');
      fixture$.appendTo(document.body);

      injector.mock('bic/model/application', mockApp);
      injector.require(['bic/view/form/list'], function (required) {
        View = required;
        done();
      });
    });

    after(function () {
      window.BMP.Forms = oldForms;
      injector.remove();
      fixture$.remove();
    });

    it('should be a Backbone.View object constructor', function () {
      assert(View);
      assert.instanceOf(View, Function);
    });

    // run the same tests against each definition
    Object.keys(DEFINITIONS).forEach(function (defName) {
      describe('definition: ' + defName, function () {
        var view;

        before(function () {
          fixture$.empty();
          mockForms.getDefinition = function () {
            return Promise.resolve(DEFINITIONS[defName]);
          };
          view = new View({ model: mockModel });
        });

        after(function () {
          view.remove();
        });

        it('render() creates a table', function (done) {
          view.on('render', function () {
            fixture$.append(view.$el);
            assert.lengthOf(fixture$.find('table'), 1);
            done();
          });

          assert(view);

          view.render();
        });

        it('table contains expected tr elements', function () {
          var tr$ = fixture$.find('table > tbody > tr');
          assert.lengthOf(tr$, 2);
          tr$.each(function () {
            var tr$ = $(this);
            assert.lengthOf(tr$.find('a'), 3);
          });
          assert.include(tr$.first().text(), 'abcdef');
          assert.include(tr$.last().text(), 'ghijkl');
        });
      });
    });
  });
});
