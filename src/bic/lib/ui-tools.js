/* eslint-disable no-unused-vars */
/* because defining the variable allows the functions to be used in
this module, allowing function composition etc etc
*/

/**
  Tools for working with the ui

  @module lib/ui-tools
*/
define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');

  // this module

  var exports = {};

  /**
  disables an element and applies the disabled style

  @param {string} selector - The selector of the element

  @returns {$element} A jQuery wrapped element
  */
  var disableElement = exports.disableElement = function (selector) {
    return $(selector).attr('disabled', true)
                      .addClass('ui-disabled');
  };

  /**
  enables an element and removes the disabled style

  @param {string} selector - The selector of the element

  @returns {$element} A jQuery wrapped element
  */
  var enableElement = exports.enableElement = function (selector) {
    return $(selector).removeAttr('disabled')
                      .removeClass('ui-disabled');
  };

  /**
  shows the loading animation
  */
  var showLoadingAnimation = exports.showLoadingAnimation = function () {
    $.mobile.loading('show');
  };

  /**
  hides the loading animation
  */
  var hideLoadingAnimation = exports.hideLoadingAnimation = function () {
    $.mobile.loading('hide');
  };

  return exports;
});
/* eslint-enable no-unused-vars */
