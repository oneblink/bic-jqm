define([
  'Squire', 'backbone', 'bic/enum-model-status', 'sinon', 'BlinkForms', 'chai'
], function (Squire, Backbone, MODEL_STATUS, sinon, Forms, chai) {
  'use strict';

  var CONTEXT = 'tests/unit/view-form-controls.js';
  var should = chai.should();

  describe('View - Form Controls ', function () {
    var injector, View, apiStub, errorStub;
    var mockApp;
    var pageid = 0,
      pageObject = {
        length: 4,
        current: {
          'index': function() { return pageid; }
        },
        'goto': function (num) {
          pageid = num;
        }
      };

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      Forms.current = {
        data: function() { return; },
        getErrors: function() { return; },
        get: function() {
          return pageObject;
        }
      };

      errorStub = sinon.stub(Forms.current, 'getErrors', function () {
        return {'text_box': [{'code': 'MAXLENGTH', 'MAX': '5'}]};
      });
      apiStub = sinon.stub(Forms.current, 'data');
      apiStub.onCall(0).returns(
          Promise.resolve({
              'text_box': '123456789',
              'number': 90,
              '_action': 'add',
              'subform': []
          })
      );
      apiStub.onCall(1).returns(
          Promise.resolve({
              'text_box': 'Devyani',
              'number': 99,
              '_action': 'add',
              'subform': []
          })
      );
      apiStub.onCall(2).returns(
          Promise.resolve({
              'text_box': 'Anandita',
              'number': 109,
              '_action': 'add',
              'subform': []
          })
      );
      mockApp = new Backbone.Model();

      injector.mock('bic/model-application', mockApp);
      injector.mock('bic/model-pending', Backbone.Model);
      injector.mock('text!bic/template/form/controls.mustache', 'string');
      injector.mock('bic/api', function () { return null; });
      injector.require(['bic/view-form-controls'], function (required) {
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

    describe('pages collection', function () {
      var gotoSpy;
      var indexSpy;
      var view;

      beforeEach(function (done) {
        //setup spys
        indexSpy = sinon.spy(pageObject.current, 'index');
        gotoSpy = sinon.spy(pageObject, 'goto');

        injector.require(['bic/model-application'], function (app) {
          view = new View({ model: app});
          done();
        });
      });

      afterEach(function () {
        //remove spy
        pageObject.current.index.restore();
        pageObject.goto.restore();
      });

      it('nextFormPage', function() {
        //move to next page
        view.nextFormPage();
        assert.equal(indexSpy.callCount, 1);
        assert.equal(gotoSpy.callCount, 1);
        assert.equal(pageid, 1);
      });

      it('firstFormPage', function() {
        //move to first page
        view.firstFormPage();
        assert.equal(indexSpy.callCount, 1);
        assert.equal(gotoSpy.callCount, 1);
        assert.equal(pageid, 0);

        //should not re-render the page because already on first page
        view.firstFormPage();
        assert.equal(indexSpy.callCount, 2);
        assert.equal(gotoSpy.callCount, 1);
      });

      it('lastFormPage', function() {
        //move to last page
        view.lastFormPage();
        assert.equal(indexSpy.callCount, 1);
        assert.equal(gotoSpy.callCount, 1);
        assert.equal(pageid, pageObject.length - 1);

        //should not re-render the page because already on last page
        view.lastFormPage();
        assert.equal(indexSpy.callCount, 2);
        assert.equal(gotoSpy.callCount, 1);
      });

      it('previousFormPage', function() {
        //move to second last page
        view.previousFormPage();
        assert.equal(indexSpy.callCount, 1);
        assert.equal(gotoSpy.callCount, 1);
        assert.equal(pageid, pageObject.length - 2);
      });

    });

    describe('addToQueue', function () {
      var view, processQueueStub;

      before(function (done) {
        injector.require(['bic/model-application'], function (app) {
          view = new View({ model: app});
          app.view = {
            pendingQueue: sinon.stub()
          };

          app.getArgument = sinon.stub();
          app.getArgument.withArgs('pid').returns('1');
          app.setArgument = sinon.stub();
          app.setArgument.withArgs('pid').returns('1');

          injector.require(['bic/model-pending'], function (PendingItem){
            var PCol = Backbone.Collection.extend({ model: PendingItem });
            app.pending = new PCol();
            app.pending.processQueue = function () { return; };
            processQueueStub = sinon.stub(app.pending, 'processQueue');
            done();
          });

        });
      });

      it('functions on view', function () {
        expect(view.formSubmit).to.be.an.instanceOf(Function);
        expect(view.formClose).to.be.an.instanceOf(Function);
        expect(view.previousFormPage).to.be.an.instanceOf(Function);
        expect(view.nextFormPage).to.be.an.instanceOf(Function);
        expect(view.firstFormPage).to.be.an.instanceOf(Function);
        expect(view.lastFormPage).to.be.an.instanceOf(Function);
        expect(view.formSave).to.be.an.instanceOf(Function);
        expect(view.formDiscard).to.be.an.instanceOf(Function);
        expect(view.addToQueue).to.be.an.instanceOf(Function);
      });

      it('should add item with status Pending in pending queue', function (done) {
        var pendingQueue;
        //checking stubs are not called
        should.exist(view.model);
        expect(apiStub.called).to.equal(false);
        expect(errorStub.called).to.equal(false);
        expect(processQueueStub.called).to.equal(false);

        mockApp.set('args', []);
        view.addToQueue(MODEL_STATUS.PENDING, true).then(function(){
          expect(apiStub.called).to.equal(true);
          pendingQueue = mockApp.pending.where({status: MODEL_STATUS.PENDING});
          expect(pendingQueue.length).to.equal(1);
          expect(pendingQueue[0].get('data').text_box).to.equal('123456789');
          done();
        });
      });

      it('should add item with status Draft in pending queue', function (done) {
        var draftQueue;

        mockApp.set('args', []);
        view.addToQueue(MODEL_STATUS.DRAFT, true).then(function(){
          return view.addToQueue(MODEL_STATUS.DRAFT, true);
        }).then(function(){
          draftQueue = mockApp.pending.where({status: MODEL_STATUS.DRAFT});
          expect(draftQueue.length).to.equal(2);
          expect(draftQueue[0].get('data').text_box).to.equal('Devyani');
          expect(draftQueue[1].get('data').text_box).to.equal('Anandita');
          done();
        });
      });

    });

    describe('formLeave', function(){
      var origGet
        , viewInstance
        , modelGetStub
        , interactionGetStub;

      beforeEach(function(){
        var mockModel;

        origGet = Forms.current.get;
        Forms.current.get = function(){};

        interactionGetStub = sinon.stub(Forms.current, 'get');

        mockModel = {
          get: function(){}
        };

        modelGetStub = sinon.stub(mockModel, 'get')
                            .returns('add');

        viewInstance = new View();
        viewInstance.model = mockModel;
      });

      afterEach(function(){
        Forms.current.get = origGet;
        modelGetStub.restore();
        interactionGetStub.restore();
      });

      it('should go home', function(){
        var viewMock;
        var expectation;

        mockApp.history = [];
        mockApp.view = {
          home: function(){}
        };

        viewMock = sinon.mock(mockApp.view);
        expectation = viewMock.expects('home');
        expectation.once();

        interactionGetStub.returns(undefined);

        viewInstance.formLeave();

        expectation.verify();
      });

      it('should execute the onLeave action', function(){
        var afterInteraction
          , afterInteractionMock
          , afterInteractionExpectation;


        afterInteraction = {
          add: function(){}
        };

        afterInteractionMock = sinon.mock(afterInteraction);
        afterInteractionExpectation = afterInteractionMock.expects('add');
        afterInteractionExpectation.once();

        interactionGetStub.returns(afterInteraction);

        viewInstance.formLeave();

        afterInteractionExpectation.verify();

        afterInteractionMock.restore();
      });
    });
  });

});
