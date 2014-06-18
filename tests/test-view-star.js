/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define(['Squire'], function (Squire) {
  "use strict";

  describe('View - Star - jQuery Mobile Implementation', function () {
    var injector, View;

    before(function (done) {
      injector = new Squire();

      injector.require(['../scripts/view-star'], function (rView) {
        View = rView;
        done();
      });
    });

    it("should exist", function () {
      should.exist(View);
    });

    it("should be a Backbone.View object constructor", function () {
      View.should.be.an.instanceOf(Function);
    });

    describe('DOM Events', function () {
      it('should toggle the state of the star when pressed');
    });

    describe('Content Rendering', function () {
      it('should render a filled star when active');
      it('should render an empty star when inactive');
    });

    describe('Navigation Handling', function () {
      it('should prevent links underneath the star being activated');
    });
  });
});
