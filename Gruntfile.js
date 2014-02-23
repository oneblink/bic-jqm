/*global module:false*/
module.exports = function (grunt) {
  "use strict";
  grunt.initConfig({

    concurrent: {
      background: ['connect', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    },

    connect: {
      server: {
        options: {
          port: 9001,
          base: '.',
          keepalive: true
        }
      }
    },

    watch: {
      source: {
        files: ['index.php', 'scripts/**', 'tests/**'],
        tasks: ['default'],
        options: {
          livereload: true
        }
      }
    },

    jslint: {
      files: ['./scripts/*.js'],
      directives: {
        "browser": true,
        "es5": true,
        "nomen": true,
        "indent": 2,
        "stupid": true,
        "predef" : [
          "define",
          "require",
          "requirejs",
          "$",
          "_",
          "Backbone",
          "Mustache",
          "Pouch",
          "BlinkForms",
          "jquerymobile",
          "BMP",
          "Modernizr"
        ]
      }
    },

    mocha: {
      all: ['tests/index.html'],
      options: {
        bail: true,
        reporter: 'Nyan'
      }
    },

    clean: ['build'],

    requirejs: {
      compile: {
        options: {
          baseUrl: 'scripts',
          name: 'vendor/almond',
          include: ['main', 'router'],
          out: 'build/bic.js',
          optimize: "none",
          paths: {
            text: 'vendor/text',
            domReady: 'vendor/domReady',
            feature: 'vendor/feature',
            implementations: 'implementation-data'
          },
          wrap: {
            startFile: 'scripts/frag/start.frag',
            endFile: 'scripts/frag/end.frag'
          }//,
          // wrap: true,
          //insertRequire: ["main"]
        }
      }
    },

    copy: {
      main: {
        files: [
          {
            src: 'build/bic.js',
            dest: 'js/bic.js'
          }
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('default', ['test', 'build']);
  grunt.registerTask('test', ['jslint', 'mocha']);
  grunt.registerTask('build', ['clean', 'requirejs', 'copy', 'clean']);
  grunt.registerTask('develop', ['concurrent']);

};
