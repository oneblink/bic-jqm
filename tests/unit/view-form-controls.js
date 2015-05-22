define(['Squire', 'backbone'], function (Squire, Backbone) {
  'use strict';

  describe('View - Form Controls ', function () {
    var injector, View, apiStub, errorStub;
    var mockApp;

    before(function (done) {
      injector = new Squire();

      // window.BMP.BIC3.history = { length: 0 };
      window.BMP.BIC3 = {
        history: {
          length: 0
        },
        view: {
          home: function(){}
        }
      };
      BlinkForms.current = {
        data: function() { return; },
        getErrors: function() { return; }
      };

      errorStub = sinon.stub(BlinkForms.current, 'getErrors', function () {
        return {"text_box": [{"code": "MAXLENGTH", "MAX": "5"}]};
      });
      apiStub = sinon.stub(BlinkForms.current, 'data');
      apiStub.onCall(0).returns(
          Promise.resolve({
              "text_box": "123456789",
              "number": 90,
              "_action": "add",
              "subform": []
          })
      );
      apiStub.onCall(1).returns(
          Promise.resolve({
              "text_box": "Devyani",
              "number": 99,
              "_action": "add",
              "subform": []
          })
      );
      apiStub.onCall(2).returns(
          Promise.resolve({
              "text_box": "Anandita",
              "number": 109,
              "_action": "add",
              "subform": []
          })
      );
      mockApp = new Backbone.Model();

      injector.mock('model-application', mockApp);
      injector.mock('model-pending', Backbone.Model);
      injector.mock('text!template-form-controls.mustache', 'string');
      injector.mock('feature!api', function () { return null; });
      injector.require(['view-form-controls'], function (required) {
        View = required;
        done();
      });
    });

    it('should exist', function () {
      should.exist(View);
    });

    it('should be a Backbone.View object constructor', function () {
      View.should.be.an.instanceOf(Function);
    });

    describe('addToQueue', function () {
      var view, processQueueStub;

      before(function (done) {
        injector.require(['model-application'], function (app) {
          view = new View({ model: app});
          app.view = {
            pendingQueue: sinon.stub()
          };

          injector.require(['model-pending'], function (PendingItem){
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
        view.addToQueue('Pending');
        expect(apiStub.called).to.equal(true);


        setTimeout(function () {
          pendingQueue = mockApp.pending.where({status: 'Pending'});
          expect(pendingQueue.length).to.equal(1);
          expect(pendingQueue[0].get('data').text_box).to.equal('123456789');
        }, 1e3);
        done();
      });

      it('should add item with status Draft in pending queue', function (done) {
        var draftQueue;

        mockApp.set('args', []);
        view.addToQueue('Draft');
        view.addToQueue('Draft');

        setTimeout(function () {
          draftQueue = mockApp.pending.where({status: 'Draft'});
          expect(draftQueue.length).to.equal(2);
          expect(draftQueue[0].get('data').text_box).to.equal('Devyani');
          expect(draftQueue[1].get('data').text_box).to.equal('Anandita');
        }, 1e3);
        done();
      });

    });

  });

});
