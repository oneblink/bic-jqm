/*global module:false*/
module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({

    watch: {
      files: ['**/source*'],
      tasks: ['jslint'],
      options: {
        nospawn: true
      }
    },

    jslint: {
      files: ['./source/**/*.js'],
      directives: {
        "browser": true,
        "es5": true,
        "nomen": true,
        "todo": true,
        "indent": 2,
        "predef" : [
          "define",
          "require",
          "requirejs"
        ]
      }
    },

    mocha: {
      all: ['tests/*'],
      options: {
        reporter: 'Nyan'
      }
    },

    clean: ['build'],

    requirejs: {
      compile: {
        options: {
          baseUrl: 'source',
          modules: [{
            name: 'main',
            exclude: ['text']
          }],
          mainConfigFile: 'source/main.js',
          dir: 'build',
          // generateSourceMaps: false,
          paths: {
            text: 'empty:',
            jquery: 'empty:',
            jquerymobile: 'empty:',
            underscore: 'empty:',
            backbone: 'empty:',
            mustache: 'empty:',
            BlinkForms: 'empty:',
            rivets: 'empty:',
            q: 'empty:',
            pouchdb: 'empty:'
          },
          wrap: true,
          optimize: 'none',
          normalizeDirDefines: true
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('default', ['jslint']);
  grunt.registerTask('build', ['clean', 'requirejs']);

};
