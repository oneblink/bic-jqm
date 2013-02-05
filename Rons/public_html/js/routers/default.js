/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from require.JS

/*jslint nomen:true*/ // rules for Underscore.JS

define([
  'logger',
  'jQuery',
  'underscore',
  'backbone',
  'jQueryMobile',
  'models/answerSpace',
  'views/answerSpace/select',
  'views/Interaction/prompt',
  'views/Interaction/result',
  'collections/Interactions',
  'views/Interactions/list'
  ],
  function(logger, $, _, Backbone, jqm,
    AnswerSpace, answerSpaceSelect,
    InteractionPrompt, InteractionResult,
    Interactions, InteractionsList) {
    'use strict';
    var $body = $('body'),
    bmp = window.BlinkApp,
    /**
     * @inner
     * @constructor
     * @param {Array} interactions names arranged in descending ancestry
     * @param {Object} parameters map of a=1&b=2&c=3 URL query parameters
     */
    showInteraction = function(interactions, parameters) {
      var ancestors = [],
      type,
      leaf,
      view,
      path = '/',
      collection,
      name;
      /* END: var */
      // cull any interactions that don't exist
      $.each(interactions, function(index, value) {
        if (bmp.interactions[value]) {
          ancestors.push(bmp.interactions[value]);
        }
      });
      leaf = ancestors.pop();
      ancestors.unshift(bmp.answerSpace);
      leaf.set('_ancestors', ancestors);
      type = leaf.get('type');
      // handle Category
      if (type === 'category') {
        name = leaf.get('name') || leaf.get('siteName');
        $.each(ancestors, function(index, model) {
          path += (model.get('name') || model.get('siteName')) + '/';
        });
        collection = new Interactions([], {
          tags: [ 'nav-' + name.toLowerCase() ],
          path: path,
          category: leaf
        });
        logger.log('path=' + path);
        view = new InteractionsList({
          collection: collection
        });
      
      // handle Interaction
      } else if (leaf.get('inputPrompt') &&
          ($.isEmptyObject(parameters) || parameters.inputs)) {
        view = new InteractionPrompt({model: leaf});
      } else {
        view = new InteractionResult({model: leaf});
      }
      view.show();
    },
    /**
     * @inner
     * @constructor
     */
    showAnswerSpace = function() {
      var map = bmp.answerSpace.get('map'),
      name = bmp.answerSpace.get('siteName'),
      interactions = new Interactions([], {
        tags: [ 'nav-' + name.toLowerCase() ],
        path: '/' + name + '/',
        category: bmp.answerSpace
      }),
      list = new InteractionsList({ collection: interactions });
      /* END: var */
      logger.log('showAnswerSpace: ' + bmp.answerSpace.get('siteName'));
      list.show();
    },
    /**
     * @inner
     * @constructor
     */
    showNoAnswerSpace = function() {
      if ($.isObject(bmp.answerSpace)) {
        // TODO: thoroughly scrub old answerSpace material away
        bmp.answerSpace.clear();
        delete bmp.interactions;
      }
      answerSpaceSelect.show();
    },
    /**
     * @inner
     * @constructor
     */
    Router = Backbone.Router.extend({
      routes: {        
        // one route, as we have recursive paths that can't be identified here
        '*uri': 'defaultRoute'
      },
      defaultRoute: function(uri) {
        var queryString,
        fragment,
        answerSpace,
        interactions,
        charIndex,
        dfrdAnswerSpace,
        $activePage = $(jqm.activePage),
        originalUri;
        /* END: var */
        uri = $.trim(uri);
        originalUri = uri;
        logger.log('default route:' + uri);
        
        // check if no answerSpace specified
        if (!uri || uri === '/') {
          showNoAnswerSpace();
          return;
        }
        
        // TODO: use jQueryMobile's path parser instead of below code
        
        // identify #fragment
        charIndex = uri.indexOf('#');
        if (charIndex !== -1) {
          fragment = uri.substr(charIndex + 1);
          uri = uri.substr(0, charIndex);
        }

        // identify ?queryString
        charIndex = uri.indexOf('?');
        if (charIndex !== -1) {
          queryString = uri.substr(charIndex + 1);
          uri = uri.substr(0, charIndex);
        }
        
        // identify /path parts
        charIndex = uri.indexOf('/');
        if (charIndex !== -1) {
          interactions = uri.split('/');
          answerSpace = interactions.shift();
          interactions = $.grep(interactions, function(value, index) {
            return typeof value === 'string' && $.trim(value).length > 0; 
          });
        } else {
          answerSpace = uri;
          interactions = [];
        }
        answerSpace = decodeURIComponent(answerSpace).toLowerCase();
        interactions = $.map(interactions, function(value, index) {
          return decodeURIComponent(value).toLowerCase();
        });
        
        if (!bmp.answerSpace || !bmp.answerSpace.get('siteName')
            || bmp.answerSpace.get('siteName') !== answerSpace) {
          bmp.answerSpace = new AnswerSpace({
            name: answerSpace
          });
          dfrdAnswerSpace = bmp.answerSpace.fetch();
        } else {
          dfrdAnswerSpace = true;
        }
        
        logger.log('a=' + answerSpace + ' i=[' + interactions.join(',') + ']' + ' ?=' + queryString + ' #=' + fragment);
                
        $.when(dfrdAnswerSpace)
        .fail(function() {
          // TODO: check to see if we have a cached copy
          window.alert('error: fetching answerSpace details from server');
        })
        .then(function() {
          // do nothing else if we are already viewing required content
          if (originalUri.replace(/\/$/, '') === $activePage.data('url')) {
            return;
          }
          // redirect to BIC v2 if necessary
          if (bmp.answerSpace.get('bicVersion') !== 'v3') {
            window.location.assign('/' + bmp.answerSpace.get('siteName'));
            return;
          }
          // otherwise, continue with BIC v3
          if (interactions.length === 0) {
            showAnswerSpace();
            return;
          } else {
            if (queryString) {
              showInteraction(interactions, $.deparam(queryString, true));
            } else {
              showInteraction(interactions);
            }
            return;
          }
        });
      }
    });
    /* END: var */
    
    return new Router();
  });