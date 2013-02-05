/*jslint white:true*/ // ignore white-space issues
/*jslint browser:true*/ // assume "window" and other browser globals
/*global define:true, require:true*/ // globals from require.JS

define(['jQuery'], function($) {
  'use strict';
  var Modernizr = window.Modernizr,
  doc = window.document;
  // delete window.Modernizr; // we will leave the global available for now

  Modernizr.addTest('positionfixed', function () {
    var test = doc.createElement('div'),
    fake = false,
    root = doc.body || (function () {
      fake = true;
      return doc.documentElement.appendChild(doc.createElement('body'));
    }()),
    oldCssText = root.style.cssText,
    ret, offset;
    /* END: var */
    root.style.cssText = 'height: 3000px; margin: 0; padding; 0;';
    test.style.cssText = 'position: fixed; top: 100px';
    root.appendChild(test);
    window.scrollTo(0, 500);
    offset = $(test).offset();
    ret = offset.top === 600; // 100 + 500
    if (!ret && typeof test.getBoundingClientRect !== 'undefined') {
      ret = test.getBoundingClientRect().top === 100;
    }
    root.removeChild(test);
    root.style.cssText = oldCssText;
    window.scrollTo(0, 1);
    if (fake) {
      doc.documentElement.removeChild(root);
    }
    return ret;
  });
	
  Modernizr.addTest('xpath', function () {
    var xml = $.parseXML('<xml />');
    return !!window.XPathResult && !!xml.evaluate;
  });

  return Modernizr;
});

