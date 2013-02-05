/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from require.JS

define(['PHP', 'jQuery', 'blinkforms2'],
  function(PHP, $) {
    'use strict';
    var Modernizr = window.Modernizr;
    
    Modernizr.load('/_R_/common/3/BlinkForms2.css');
    
    window.siteVars = window.siteVars || window.BlinkApp;
    
    $.extend(window.BlinkApp, {
      serverAppBranch: "R",
			serverAppVersion: 3,
			serverAppPath: "/_R_/common/3"
    });
    
    return window.BlinkForms;
  });

