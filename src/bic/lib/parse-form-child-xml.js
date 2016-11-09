define(function (require) {
  'use strict';

  var $ = require('jquery');
  var _ = require('underscore');

  var XMLSerialiser = new window.XMLSerializer();

  function xmlNodeReducer (memo, node) {
    return memo + XMLSerialiser.serializeToString(node);
  }

  /**
   * @typedef {Object} XMLParseResult
   *
   * @property {string} * - String representation of Either the value or subform Form definitions.
   */

  /**
   * Takes a xml node and turns it into the format required for FORMS
   *
   * @param  {Node} xmlNode     - The XML Node of the subform element.
   * @return {XMLParseResult} - The result of parsing the subform node
   */
  return function parseFormChildXML (xmlNode) {
    var result = {};
    var $xmlNode = $(xmlNode);
    var children = $xmlNode.children();

    result[$xmlNode.prop('nodeName')] = children.length ? _.reduce(children, xmlNodeReducer, '') : $xmlNode.text();

    return result;
  };
});
