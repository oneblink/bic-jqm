/*global module:false*/
module.exports = function (grunt) {
  "use strict";
  grunt.initConfig({

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
        files: ['*', 'scripts/**'],
        tasks: ['build'],
      },
      tests: {
        files: ['tests/**'],
        tasks: ['mocha'],
      }
    },

    jslint: {
      files: ['./scripts/**/*.js'],
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
      all: ['tests/*!(assets)/index.html'],
      options: {
        reporter: 'Nyan',
        globals: 'BMP'
      },
    },

    clean: ['build'],

    requirejs: {
      compile: {
        options: {
          baseUrl: 'scripts',
          modules: [{ name: 'main' }],
          mainConfigFile: 'scripts/main.js',
          dir: 'build',
          optimize: "uglify2",
          generateSourceMaps: true,
          preserveLicenseComments: false,
          paths: {
            text: '../js/text',
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
          wrap: true
        }
      }
    },

    copy: {
      main: {
        files: [
          {
            src: 'build/main.js',
            dest: 'js/main.js'
          },
          {
            src: 'build/main.js.map',
            dest: 'js/main.js.map'
          },
          {
            src: 'build/main.js.src',
            dest: 'js/main.js.src'
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

  grunt.registerTask('default', ['jslint']);
  grunt.registerTask('build', ['mocha', 'clean', 'requirejs', 'copy', 'clean']);

};
