define(['jquery', 'Squire', 'backbone', 'chai'], function ($, Squire, Backbone, chai) {
  'use strict';

  var CONTEXT = 'tests/unit/collection/form-records.js';
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

  describe('Collection - FormRecords', function () {
    var injector, Collection, collection;
    var form;
    var api;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      api = {
        getFormList: {}
      };

      // import global `require('dep')` into local `injector.require('dep')`
      injector.mock('backbone', Backbone);

      injector.mock('BlinkForms', {});
      injector.mock('bic/model/application', Backbone.Model);
      injector.mock('bic/model/form-record', Backbone.Model);
      injector.mock('bic/api/web', api);

      injector.require(['bic/collection/form-records'], function (rCol) {
        Collection = rCol;
        done();
      });
    });

    after(function () {
      injector.remove();
    });

    beforeEach(function (done) {
      collection = new Collection();
      done();
    });

    it('should exist', function () {
      should.exist(Collection);
    });

    describe('#datastore', function () {
      it('should create a datastore for the collection', function () {
        expect(collection).to.not.have.property('data');
        collection.datastore();
        expect(collection).to.have.property('data');
      });

      it('should return itself', function () {
        expect(collection.datastore()).to.equal(collection);
      });
    });

    describe('#load', function () {
      beforeEach(function (done) {
        collection.datastore();
        sinon.stub(collection.data, 'readAll', function () {
          return Promise.resolve();
        });
        done();
      });

      it('should return a promise', function () {
        expect(collection.load()).to.be.instanceOf(Promise);
      });

      it('should populate the datastore from cache', function (done) {
        collection.load().then(function () {
          done();
        }).catch(function () {
          done();
        });
      });
    });

    describe('API.getFormList(formName)', function () {
      it('should correctly parse the xml (one line xml)', function (done) {
        var collection;
        var record;

        api.getFormList = function () {
          var parser = new DOMParser();
          var formRecord;

          formRecord = '<xml>';
          formRecord += '<test><id>1</id><Text1>1</Text1><Text2>2</Text2><Text3>3</Text3></test>';
          formRecord += '<test><id>2</id><Text1>12</Text1><Text2>22</Text2><Text3>32</Text3></test>';
          formRecord += '</xml>';

          return Promise.resolve(parser.parseFromString(formRecord, "text/xml"));
        };

        collection = new Collection();
        form = 'test';
        record = [{
          'formName': form,
          'id': "1",
          'list': {
            'Text1': "1",
            'Text2': "2",
            'Text3': "3"
          }
        }, {
          'formName': form,
          'id': "2",
          'list': {
            'Text1': "12",
            'Text2': "22",
            'Text3': "32"
          }
        }];

        collection.pull(form).then(function () {
          record.forEach(function (rec, i) {
            rec._id = form + "-" + rec.id;
            assert.deepEqual(rec, collection.models[i].toJSON());
          });
          done();
        });
      });

      it('should correctly parse the xml (prettified XML)', function (done) {
        var collection;
        var record;

        this.timeout(5e3);

        api.getFormList = function () {
          return $.ajax('/tests/assets/GetFormList.xml');
        };

        collection = new Collection();
        form = 'test';
        record = [{
          'formName': form,
          'id': "1",
          'list': {
            'Text1': "1",
            'Text2': "2",
            'Text3': "3"
          }
        }, {
          'formName': form,
          'id': "2",
          'list': {
            'Text1': "12",
            'Text2': "22",
            'Text3': "32"
          }
        }];

        collection.pull(form).then(function () {
          record.forEach(function (rec, i) {
            rec._id = form + "-" + rec.id;
            assert.deepEqual(rec, collection.models[i].toJSON());
          });
          done();
        });
      });
    });
  });
});
