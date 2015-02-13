define(function () {
  'use strict';
  describe('Forms v3 dependencies', function () {

    this.timeout(8e3);

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

    describe('Promises', function () {
      before(function (done) {
        require(['feature!promises'], function () {
          done();
        });
      });

      it('should load successfully and export a Function', function () {
        var Promise = require('feature!promises');
        Promise.should.be.an.instanceOf(Function);
      });
    });

    describe('Pick-a-Date.js', function () {
      before(function (done) {
        this.timeout(5e3);
        require(['picker.date'], function () {
          done();
        });
      });

      it('should load successfully and install a jQuery plugin', function () {
        var $ = require('jquery');
        $.fn.pickadate.should.be.an.instanceOf(Function);
      });
    });

    //describe('Forms v3 with jQuery Mobile', function () {
      //before(function (done) {
        //require(['BlinkForms'], function () {
          //done();
        //});
      //});

      //it('should load successfully and export an Object', function () {
        //var Forms = require('BlinkForms');
        //Forms.should.be.an.instanceOf(Object);
      //});
    //});

    //describe('BIC-JQM + Forms v3', function () {
      //before(function (done) {
        //require(['bic', 'BlinkForms'], function () {
          //setTimeout(function () {
            //done();
          //}, 197);
        //});
      //});

      //it('BMP.Forms.getDefinition function should be defined', function () {
        //var Forms = require('BlinkForms');
        //Forms.getDefinition.should.be.an.instanceOf(Function);
      //});

      //it('BMP.Forms.getDefinition should return a promise', function () {
        //var Promise, Forms;
        //Forms = require('BlinkForms');
        //Promise = require('feature!promises');
        //Forms.getDefinition().should.be.an.instanceOf(Promise);
      //});
    //});
  });
});
