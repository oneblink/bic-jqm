define(['jquery', 'Squire', 'backbone', 'chai'], function ($, Squire, Backbone, chai) {
  'use strict';

  var CONTEXT = 'tests/unit/model/forms.js';
  var should = chai.should();

  function isPhantom () {
    return navigator.userAgent.toLowerCase().indexOf('phantom') !== -1;
  }

  function isKarma () {
    return !!window.__karma__;
  }

  if (isPhantom() || isKarma()) {
    return false;
  }

  describe('Model - FormRecord', function () {
    var injector, Model;
    var form;
    var api;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      api = {
        getFormRecord: {}
      };

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('backbone', Backbone);

      injector.mock('bic/api/web', api);

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
      it('should correctly parse the xml (one line xml)', function (done) {
        var model;
        var record;

        api.getFormRecord = function () {
          var parser = new DOMParser();
          var formRecord;

          formRecord = '<?xml version="1.0" encoding="utf-8"?><test><id>1</id><Text1>1</Text1><Text2>2</Text2><Text3>3</Text3></test>';

          return Promise.resolve(parser.parseFromString(formRecord, 'text/xml'));
        };

        form = 'test';
        model = new Model({_id: '1', formName: form});
        record = {
          'Text1': '1',
          'Text2': '2',
          'Text3': '3',
          'id': '1'
        };

        model.populate();
        model.on('change', function () {
          assert.deepEqual(model.get('record'), record);
          done();
        });
      });

      it('should correctly parse the xml (prettified XML)', function (done) {
        var model;
        var record;

        this.timeout(5e3);

        api.getFormRecord = function () {
          return $.ajax('/tests/assets/getFormRecord.xml');
        };

        model = new Model({_id: '1', formName: form});
        form = 'test';

        record = {
          'Text1': '1',
          'Text2': '2',
          'Text3': '3',
          'id': '1'
        };
        model.populate();
        model.on('change', function () {
          assert.deepEqual(model.get('record'), record);
          done();
        });
      });

      it('should keep subform xml information', function (done) {
        var model;

        api.getFormRecord = function () {
          return $.ajax('/tests/assets/singleFormRecordWithSubforms.xml');
        };

        model = new Model({_id: '1', formName: 'firstLevel'});
        model.populate();
        model.on('change', function () {
          var subformXML;
          var xmlDOM;
          var parser = new DOMParser();

          subformXML = model.get('record').second_level_test;
          assert.isString(subformXML);

          xmlDOM = parser.parseFromString(subformXML, 'text/xml');

          //subform tag names will be the name of the element, or html;
          //if there was a parse error
          assert.notEqual(xmlDOM.documentElement.tagName, 'html');
          done();
        });
      });
    });
  });
});
