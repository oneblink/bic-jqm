define(['Squire', 'backbone', 'chai'], function (Squire, Backbone, chai) {
  'use strict';

  var CONTEXT = 'tests/unit/model/forms.js';
  var should = chai.should();

  describe('Model - FormRecord', function () {
    var injector, Model;
    var form, formRecord;

    before(function (done) {
      var parser;
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      parser = new DOMParser();
      form = 'test';
      formRecord = '<?xml version="1.0" encoding="utf-8"?><test><id>1</id><Text1>1</Text1><Text2>2</Text2><Text3>3</Text3></test>';

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('backbone', Backbone);

      injector.mock('bic/api/web', {
        getFormRecord: function () {
          return Promise.resolve(parser.parseFromString(formRecord, "text/xml"));
        }
      });

      injector.require(['bic/model/form-record'], function (model) {
        Model = model;
        done();
      }, function () {
        done();
      });
    });

    after(function () {
      injector.remove();
    });

    it('should exist', function () {
      should.exist(Model);
    });

    it('should be a constructor function', function () {
      Model.should.be.an.instanceOf(Function);
    });

    describe('#populate', function () {
      it('should correctly parse the xml', function (done) {
        var model = new Model({_id: '1', formName: form});
        var record = {
          'Text1': "1",
          'Text2': "2",
          'Text3': "3",
          'id': "1"
        };
        model.populate();
        model.on('change', function () {
          assert.deepEqual(model.get('record'), record);
          done();
        });
      });
    });
  });
});
