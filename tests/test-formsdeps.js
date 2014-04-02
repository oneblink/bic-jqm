/*jslint indent:2*/
/*global define, require*/ // Require.JS and AMD
/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
// define('wrapper-backbone', [], function () {
//   "use strict";
//   return Backbone;
// });

define(function () {
  "use strict";
  describe('Forms v3 dependencies', function () {

    describe('Moment.js', function () {
      before(function (done) {
        require(['moment'], function () {
          done();
        });
      });

      it('should load successfully and export a Function', function () {
        var Moment = require('moment');
        Moment.should.be.an.instanceOf(Function);
      });
    });

    describe('Rivets.js', function () {
      before(function (done) {
        require(['rivets'], function () {
          done();
        });
      });

      it('should load successfully and export an Object', function () {
        var rivets = require('rivets');
        rivets.should.be.an.instanceOf(Object);
      });
    });

    describe('Pick-a-Date.js', function () {
      before(function (done) {
        require(['picker.date'], function () {
          done();
        });
      });

      it('should load successfully and install a jQuery plugin', function () {
        var $ = require('jquery');
        $.fn.pickadate.should.be.an.instanceOf(Function);
      });
    });

  });
});
