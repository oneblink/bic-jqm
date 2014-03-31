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
          port: 9999
        }
      },
      keepalive: {
        options: {
          port: 9999,
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
      all: {
        src: ['./scripts/*.js'],
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
      }
    },

    mocha: {
      all: {
        options: {
          urls: [
            'http://localhost:9999/tests/index.html'
          ]
        }
      },
      options: {
        bail: true
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
      },
      compile2: {
        options: {
          baseUrl: "bower_components",
          include: ['picker.date', 'picker.time', 'moment'],
          out: 'js/formsdeps.min.js',
          paths: {
            'jquery': 'empty:',
            "picker": 'pickadate/lib/picker',
            "picker.date": 'pickadate/lib/picker.date',
            "picker.time": 'pickadate/lib/picker.time',
            "moment" : 'momentjs/min/moment.min'
          }
        }
      },
      options: {
        uglify: {
          max_line_length: 80
        },
        uglify2: {
          output: {
            max_line_len: 80
          },
          warnings: false
        }
      }
    },

    'saucelabs-mocha': {
      all: { options: require('./saucelabs') }
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
  grunt.loadNpmTasks('grunt-saucelabs');

  grunt.registerTask('test', ['jslint', 'connect:server', 'mocha']);
  grunt.registerTask('travis', ['test', 'saucelabs-mocha']);

  grunt.registerTask('build', ['clean', 'requirejs', 'copy', 'clean']);
  grunt.registerTask('develop', ['concurrent']);
  grunt.registerTask('default', ['test', 'build']);

};
