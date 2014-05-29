window.Modernizr = {
  indexeddb: false
};

require.config({
  paths: {
    jquery: '/bower_components/jquery/jquery',
    underscore: '/bower_components/underscore/underscore',
    backbone: '/bower_components/backbone/backbone',
    feature: '/bower_components/amd-feature/feature',
    domReady: '/bower_components/requirejs-domready/domReady',
    text: '/bower_components/requirejs-text/text',
    'BMP.Blobs': '/blink/bmp-blobs',
    BlinkForms: '/blink/forms3jqm',
    jquerymobile: '/bower_components/jquery-mobile-bower/js/jquery.mobile-1.3.2',
    moment: '/bower_components/momentjs/min/moment.min',
    picker: '/bower_components/pickadate/lib/picker',
    'picker.date': '/bower_components/pickadate/lib/picker.date',
    'picker.time': '/bower_components/pickadate/lib/picker.time',
    sinon: '/bower_components/sinonjs/sinon',
    mustache: '/bower_components/mustache/mustache',
    implementations: '/tests/implementations'
  },
  shim: {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    'BMP.Blobs': {
      deps: ['underscore', 'jquery'],
      exports: 'BMP'
    }
  },
  baseUrl: '/scripts'
});

require([
    'text!/integration/config.json',
    'text!/integration/getform.json',
    'text!/integration/mojo.xml',
    'jquery',
    'underscore',
    'backbone',
    'BMP.Blobs',
    'BlinkForms',
    'mustache',
    'jquerymobile',
    'text!template-category-list.mustache',
    'text!template-form.mustache',
    'text!template-inputPrompt.mustache',
    'text!template-interaction.mustache',
    'text!template-pending.mustache',
    'text!template-popup.mustache'
  ], function (config, getform, mojo, $, _, Backbone, BMP, BlinkForms, Mustache) {
  window.BlinkForms = BlinkForms;
  window.Mustache = Mustache;

  var server = sinon.fakeServer.create();
  server.autoRespond = true;

  // Initial Load
  server.respondWith('/_R_/common/3/xhr/GetConfig.php', [200, {"Content-Type": "application/json"}, config]);
  server.respondWith('/_R_/common/3/xhr/GetForm.php?_v=3', [200, {"Content-Type": "application/json"}, getform]);
  server.respondWith('/_R_/common/3/xhr/GetMoJO.php?_id=1&_m=test&_lc=1', [200, { "Content-Type": "application/xml"}, mojo]);

  // MADL
  server.respondWith('/_R_/common/3/xhr/GetAnswer.php?asn=integration&iact=madl_code&ajax=false', [200, { "Content-Type": "text/html"}, 'MADL Code Interaction']);
  server.respondWith('/_R_/common/3/xhr/GetAnswer.php?asn=integration&iact=set_datasuitcase&ajax=false', [200, { "Content-Type": "text/html"}, '<?xml version="1.0" encoding="UTF-8" ?><xml><test>Integration</test></xml>']);

  require(['main'], function () {
    console.log('BIC started!');
  });
});
