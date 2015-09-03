define(['jquery', 'Squire', 'chai'], function ($, Squire, chai) {
  'use strict';

  var CONTEXT = 'tests/unit/lib/parse-xml-node.js';

  describe('parseFormChildXML', function () {
    var injector, parseFormChildXML;
    var DOMparser = new DOMParser();
    var xmlDoctype = 'text/xml';

    var formWithSubformXML;
    var result;

    before(function (done) {
      var cfg = JSON.parse(JSON.stringify(requirejs.s.contexts._.config));
      cfg.context = CONTEXT;
      require.config(cfg);
      injector = new Squire(CONTEXT);

      injector.require(['bic/lib/parse-form-child-xml'], function (pxn) {
        parseFormChildXML = pxn;
        formWithSubformXML = DOMparser.parseFromString('<?xml version="1.0" encoding="utf-8"?><firstLevel><id>24</id><first_level_req>other should be filled out, second level text will have \'hello i am second level\'</first_level_req><select_with_other>i am already filled out</select_with_other><second_level_test><second_level_field><id>10</id><second_level_text>i am filled in</second_level_text><hidden_when_first></hidden_when_first><hidden_when_text_is_a></hidden_when_text_is_a><third_level/><trigger_field></trigger_field></second_level_field><second_level_field><id>11</id><second_level_text>sfdbgfsgsf</second_level_text><hidden_when_first></hidden_when_first><hidden_when_text_is_a></hidden_when_text_is_a><third_level><third_level_sub><id>7</id><third_level_req>sfdbgfsgsf - third level</third_level_req></third_level_sub></third_level><trigger_field></trigger_field></second_level_field><second_level_field><id>12</id><second_level_text>require(\'feature!xpath\') [object]</second_level_text><hidden_when_first></hidden_when_first><hidden_when_text_is_a></hidden_when_text_is_a><third_level/><trigger_field></trigger_field></second_level_field><second_level_field><id>13</id><second_level_text>other should be filled out, second level text will have \'hello i am second level\'</second_level_text><hidden_when_first></hidden_when_first><hidden_when_text_is_a></hidden_when_text_is_a><third_level/><trigger_field></trigger_field></second_level_field></second_level_test></firstLevel>', xmlDoctype);
        result = parseFormChildXML($('firstLevel', formWithSubformXML).get(0));

        done();
      });
    });

    after(function () {
      injector.remove();
    });

    it('should create an object with the parent node as a property ', function () {
      // make sure we have the property
      assert.property(result, 'firstLevel');
    });

    // because IE likes to encode a self closing element with a space after the name and
    // other browsers dont, we cant just compare the strings :\ that would be too easy.
    describe('the contents of the property', function () {
      var subFormXML;

      before(function () {
        subFormXML = DOMparser.parseFromString('<xml>' + result.firstLevel + '</xml>', xmlDoctype);
      });

      after(function () {
        subFormXML = null;
      });

      it('should be able to make a valid xml document', function () {
        // ensure no errors with the subform xml
        assert.lengthOf(subFormXML.getElementsByTagName('parsererror'), 0);
      });

      it('should have the same number of children as the original', function () {
        // make sure that the children of the subform are the same for the original XML and the processed one
        assert.equal($(subFormXML).children().children().size(), $('firstLevel', formWithSubformXML).children().size());
      });

      it('should have the same names as the original', function () {
        var original = $('firstLevel', formWithSubformXML).children();
        var processed = $(subFormXML).children().children();
        original.each(function (index, node) {
          assert.equal(node.nodeName, processed[index].nodeName);
        });
      });

      it('should have the same values as the original', function () {
        var original = $('firstLevel', formWithSubformXML).children();
        var processed = $(subFormXML).children().children();
        original.each(function (index, node) {
          assert.equal(node.textContent, processed[index].textContent);
        });
      });
    });
  });
});
