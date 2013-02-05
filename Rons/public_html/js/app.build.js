/*
 * Instructions:
 * - install Node.JS and NPM (http://nodejs.org/, http://npmjs.org/)
 * - install Require.JS tools (run "npm -g install requirejs")
 * - install Uglify-JS (run "npm -g install uglify-js")
 * - run "r.js -o path/to/app.build.js"
 */

/*jslint white:true*/
({
  baseDir: './',
  dir: './',
  keepBuildDir: true,
  mainConfigFile: './bootstrap.js',
  uglify: {
    max_line_length: 80,
    ascii_only: true
  },
  inlineText: true,
  skipPragmas: true,
  skipModuleInsertion: true,
  // project specific files below
  modules: [
    {
      name: 'bootstrap',
      insertRequire: ['bootstrap'],
      out: 'bootstrap.1.js',
      optimize: 'none'
    }/*,
    {
      name: 'bootstrap',
      insertRequire: ['bootstrap'],
      out: 'bootstrap.min.js',
      optimize: 'uglify'
    }*/
  ],
  paths: {
    text: '../../_c_/requirejs/2.0.2/text',
    i18n: '../../_c_/requirejs/2.0.2/i18n',
    Hashtable: '../../_c_/jshashtable/require-jshashtable-2.1',
    blinkforms2: '../../_R_/common/3/BlinkForms2',
    backbone: 'empty:',
    jquery: 'empty:',
    jquerymobile: 'empty:',
    underscore: 'empty:'
  },
  exclude: [
    'backbone',
    'jquery',
    'jquerymobile',
    'underscore'
  ]
})
