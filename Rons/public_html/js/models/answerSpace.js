/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from Require.JS

/*jslint nomen:true*/ // rules for Underscore.JS

define([
  'logger',
  'jQuery',
  'underscore',
  'backbone',
  'jQueryMobile',
  'models/context',
  'model-interaction-mobile',
  'collections/Interactions',
  'views/Interactions/list'
], function(logger, $, _, Backbone, jqm, context, Interaction) {
  'use strict';
  var $body = $(window.document.body),
  bmp = window.BlinkApp,
  /**
   * @inner
   * @constructor
   */
  AnswerSpace = Interaction.extend({
    defaults: {
      categories: null,
      interactions: null,
      forms: null,
      map: null
    },
    validate: function (attributes) {
      var id = attributes.id;
      if ($.type(id) !== 'number' || isNaN(id) || id <= 0 || id === Infinity) {
        return 'id must be a positive integer';
      }
    },
    initialize: function(options) {
      var self = this;
      if ($.isObject(options)) {
        self.set(options);
      }
      AnswerSpace.__super__.initialize.call(this, options);
      $.ajaxPrefilter(function(options, original, jqxhr) {
        var url = decodeURI(options.url),
        config = {
          conditions: context.attributes.conditions
        },
        id = self.get('id'),
        name = self.get('name');
        /* END: var */
        
        if (id) {
          config.answerSpaceId = id; //.substr(1);
        }
        if (name) {
          config.answerSpace = name;
        }
        /*
         * xhr.onprogress = function(e) { var string = 'AJAX progress: ' +
         * phpName; log(string + ' ' + e.position + ' ' +
         * e.total + ' ' + xhr + ' ' + options); }
         */
        if (url.length > 100) {
          url = url.substring(0, 100) + '...';
        }
        jqxhr.setRequestHeader('X-Blink-Config', JSON.stringify(config));
        jqxhr.setRequestHeader('X-Blink-Statistics', $.param({
            requests: context.bumpRequests()
          }));
        // prevent jQuery from disabling cache mechanisms
        options.cache = 'true';
        logger.log('AJAX start: ' + url);
      });
    },
    fetch: function(options) {
      var self = this,
      ajax;
      /* END: var */
      jqm.showPageLoadingMsg();
      ajax = $.ajax({
        url: '/_BICv3_/xhr/GetConfig.php',
        type: 'POST',
        dataType: 'json'
      })
      .always(function(response, status, jqxhr) {
        var answerSpaces,
        id,
        config,
        map;
        /* END: var */

        if (jqxhr.status === 200 && $.isObject(response)) {
          // find answerSpace ID and name just in case
          answerSpaces = _.filter(_.keys(response), function(key) {
            return (/^a\d+$/).test(key);
          });
          if (answerSpaces.length > 0) {
            id = parseInt(answerSpaces[0].replace('a', ''), 10);
            self.set('id', id, {silent: true});
          }
          if (self.has('id')) {
            id = self.get('id');
          }
          // setup map
          if ($.isObject(response.map)) {
            self.set('map', response.map, {silent: true});
          }
          if (self.has('map')) {
            map = self.get('map');
          }

          // TODO: do we need to do more to clean-up stale Interaction data?
          bmp.interactions = {};
          
          // update global list of Interaction models
          if ($.isObject(map)) {
            $.each(map.interactions, function(index, id) {
              var interaction,
              config = response['i' + id],
              name;
              /* END: var */
              if ($.isObject(config)) {
                name = config.pertinent.name.toLowerCase();
                interaction = new Interaction({
                  id: 'i' + id,
                  _config: config
                });
                bmp.interactions[name] = interaction;
              }
            });
            $.each(map.categories, function(index, id) {
              var interaction,
              config = response['c' + id],
              name;
              /* END: var */
              if ($.isObject(config)) {
                name = config.pertinent.name.toLowerCase();
                interaction = new Interaction({
                  id: 'c' + id,
                  _config: config,
                  type: 'category'
                });
                bmp.interactions[name] = interaction;
              }
            });
          }

          // setup config
          config = response['a' + id];
          if ($.isObject(config)) {
            $body.jqmData('answerSpace', config.pertinent.siteName);
            $body.jqmData('answerSpaceId', id);
            self.set('_config', config);
            self.set('_lastFetch', $.now());
            $('#startup_configuration').prop('checked', true);
            $('#startup_configuration').checkboxradio('refresh');
          }
          if (_.isArray(response.deviceFeatures)) {
            context.setCondition(response.deviceFeatures);
          }
          logger.log(context.attributes);
        }
        // run any handlers that were passed in options
        if (jqxhr.status === 200 || jqxhr.status === 304 || jqxhr.status === 0) {
          if ($.isObject(options) && _.isFunction(options.success)) {
            options.success(self, jqxhr.status);
          }
        } else {
          if ($.isObject(options) && _.isFunction(options.error)) { 
            options.error(self, jqxhr.status);
          }
        }
        // TODO: only trigger the change event when we know we need it
        jqm.hidePageLoadingMsg();
        self.change();
      });
      
      return ajax.promise();
    }
  });
  /* END: var */
  
  return AnswerSpace;
});
