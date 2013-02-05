/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from require.JS

define(['jQuery', 'jquerymobile'],
  function($) {
    'use strict';
    var oldChangePage;
    
    // basic templates that will be used elsewhere
    window.$.mobile.templates = {
      page: '<div data-role="page"><%=page%></div>',
      header: '<header data-role="header"><%=header%></header>',
      content: '<div data-role="content"><%=content%></div>',
      footer: '<footer data-role="footer"><%=footer%></footer>',
      listview: '<ul data-role="listview"><%=items%></ul>',
      listitem: '<li><a href="<%=href%>"><%=item%></a></li>',
      navbar: '<div data-role="navbar"></div>',
      back: '<a data-icon="back" data-rel="back">Back</a>'
    };
    
    oldChangePage = $.mobile.changePage;
    window.$.mobile.changePage = function(url, options, reverse, changeHash) {
      oldChangePage.apply($.mobile, [url, options, reverse, false]);
    };
    
    $(window.document.body).children('.ui-page-active[data-role=page]')
    .each(function(index, element) {
      window.$.mobile.activePage = element;
    });
  
    return window.$.mobile;
  });

