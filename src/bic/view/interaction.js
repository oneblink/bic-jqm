/*globals google:false*/
define(function (require) {
    'use strict';

    // foreign modules

    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var geolocation = require('@blinkmobile/geolocation');
    var Mustache = require('mustache');
    var Promise = require('bic/promise');

    // local modules

    var Template = require('text!bic/template/interaction.mustache');
    var inputPromptTemplate = require('text!bic/template/inputPrompt.mustache');
    var categoryTemplate = require('text!bic/template/category-list.mustache');
    var popupTemplate = require('text!bic/template/popup.mustache');
    var app = require('bic/model/application');
    var StarModel = require('bic/model/star');
    var StarView = require('bic/view/star');
    var PendingView = require('bic/view/form/pending');

    // this module

    var InteractionView;
    var convertIllegalUrlChars;

    require('jquerymobile');

    // due to jQuery mobile's handling of ' and " chars, we need to manually escape this.
    convertIllegalUrlChars = function (chr) {
      switch (chr) {
        case '"':
          return '%22';
        case "'":
          return '%27';
        default:
          return chr;
      }
    };

    InteractionView = Backbone.View.extend({

      initialize: function (options) {
        Backbone.View.prototype.initialize.call(this, options);
        $('body').append(this.$el);
        window.BMP.BIC.view = this;
      },

      events: {
        // Old Blink Link Shortcut Methods
        'click [keyword]': 'blinklink',
        'click [interaction]': 'blinklink',
        'click [category]': 'blinklink',
        'click [masterCategory]': 'blinklink',
        'click [back]': 'back',
        'click [home]': 'home',
        'click [login]': 'blinklink',
        'click [pending]': 'pendingQueue',

        // Form Actions
        'click #queue': 'pendingQueue',

        // Destroy
        pageremove: 'destroy'
      },

      attributes: {
        'data-role': 'page'
      },

      blinklink: function (e) {
        var $element;
        var location;
        var attributes = '';
        var first = true;
        var count;
        var path;
        var pathParts;

        e.preventDefault();

        if (e.target.tagName !== 'A') {
          $element = $(e.target).parents('a');
        } else {
          $element = $(e.target);
        }

        location = '';
        if ($element.attr('keyword')) {
          location = $element.attr('keyword');
        } else if ($element.attr('interaction')) {
          location = $element.attr('interaction');
        } else if ($element.attr('category')) {
          location = $element.attr('category');
        } else if ($element.attr('masterCategory')) {
          location = $element.attr('masterCategory');
        } else if ($element.attr('home') === '') {
          location = app.get('siteName');
        } else if ($element.attr('login') === '') {
          if (app.has('loginAccess') && app.has('loginUseInteractions') && app.has('loginUseInteractions') && app.has('loginPromptInteraction')) {
            location = app.get('loginPromptInteraction');
          } else {
            location = app.get('siteName');
          }
        }

// see https://api.jquerymobile.com/data-attribute/ for info on jquery mobile and urls with quotes and apostrophes.
// jquery mobile will die due to the way it builds the [data-url] attribute, using the html encoded variety could break existing
// users if they are parsing the query string
        for (count = 0; count < $element[0].attributes.length; count = count + 1) {
          if ($element[0].attributes[count].name.substr(0, 1) === '_') {
            if (!first) {
              attributes += '&args[' + $element[0].attributes[count].name.substr(1) + ']=' + $element[0].attributes[count].value.replace(/['"]/g, convertIllegalUrlChars);
            } else {
              first = false;
              attributes = '/?args[' + $element[0].attributes[count].name.substr(1) + ']=' + $element[0].attributes[count].value.replace(/['"]/g, convertIllegalUrlChars);
            }
          }
        }

        path = '';
        pathParts = $.mobile.path.parseLocation().pathname;
        if (app.router.isOfflineFirst) {
          // Remove file path
          pathParts = app.router.getRootRelativePath(pathParts);
        }
        pathParts = pathParts.split('/');
        pathParts.shift();

        // account for file:/// with triple slash, or leading slashes
        if (pathParts[pathParts.length - 1] === '') {
          pathParts.pop();
        }

        if (app.router.isOfflineFirst && pathParts[0] === 'index.html') {
          pathParts = [ window.BMP.BIC.siteVars.answerSpace.toLowerCase() ];
        }

        for (count = pathParts.length - 1; count !== -1; count = count - 1) {
          if (!app.interactions.get(pathParts[count].toLowerCase()).get('type') && path.indexOf(pathParts[count]) === -1 && path.indexOf(pathParts[count].toLowerCase()) === -1 && pathParts[count] !== location && pathParts[count] !== location.toLowerCase()) {
            if (path !== '') {
              path = pathParts[count] + '/' + path;
            } else {
              path = pathParts[count];
            }
          }
        }

        path = '/' + path;

        $.mobile.changePage(path + '/' + location + attributes);
      },

      back: function (e) {
        e.preventDefault();
        history.back();
      },

      home: function () {
        $.mobile.changePage('/' + app.get('siteName'));
      },

      render: function (data) {
        var form;
        var rawform;
        var inheritedAttributes = this.model.inherit({});
        var view = this;

        // Non-type specific
        if (_.has(inheritedAttributes, 'themeSwatch')) {
          this.$el.attr('data-theme', inheritedAttributes.themeSwatch);
        }

        // Input Prompt
        if (this.model.has('inputPrompt') && !this.model.has('args')) {
          rawform = this.model.get('inputPrompt');
          if (rawform.substr(0, 6) === '<form>') {
            form = rawform;
          } else {
            form = Mustache.render(inputPromptTemplate, {inputs: rawform});
          }
          this.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: form
          }));
          this.trigger('render');
        } else if (view.model.has('type') && view.model.get('type') === 'xslt') {
          // XSLT
          view.model.once('change:content', function () {
            if (typeof view.model.get('content') === 'object') {
              view.$el.html(Mustache.render(Template, {
                header: inheritedAttributes.header,
                footer: inheritedAttributes.footer,
                content: ''
              }));
              view.$el.children('[data-role=content]')[0].appendChild(view.model.get('content'));
              view.processStars();
              view.trigger('render');
            } else if (typeof view.model.get('content') === 'string') {
              view.$el.html(Mustache.render(Template, {
                header: inheritedAttributes.header,
                footer: inheritedAttributes.footer,
                content: view.model.get('content')
              }));
              view.trigger('render');
            } else {
              view.$el.html(Mustache.render(Template, {
                header: inheritedAttributes.header,
                footer: inheritedAttributes.footer,
                content: 'Unknown error rendering XSLT interaction.'
              }));
              view.trigger('render');
            }
          });
          this.model.performXSLT();

        } else if (this.model.id.toLowerCase() === window.BMP.BIC.siteVars.answerSpace.toLowerCase()) {
          // Home Screen
          view.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: Mustache.render(categoryTemplate, {
              models: view.model.get('interactionList'),
              path: data.dataUrl.substr(-1) === '/' ? data.dataUrl : data.dataUrl + '/'
            })
          }));
          view.trigger('render');
        } else if (!this.model.has('type')) {
          // Category
          view.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: Mustache.render(categoryTemplate, {
              models: _.map(_.filter(app.interactions.models, function (value) {
                return value.get('display') !== 'hide' && _.filter(value.get('tags'), function (element) {
                  return element === 'nav-' + this.model.id.toLowerCase();
                }, this).length > 0;
              }, view), function (value) {
                return value.attributes;
              }),
              path: data.dataUrl.substr(-1) === '/' ? data.dataUrl : data.dataUrl + '/'
            })
          }));
          view.trigger('render');
        } else if (this.model.get('type') === 'message') {
          this.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: inheritedAttributes.message
          }));
          this.trigger('render');
        } else {
          // MADL, others
          this.$el.html(Mustache.render(Template, inheritedAttributes));
          if (this.model.has('content')) {
            this.blinkAnswerMessages();
            this.maps();
            this.processStars();
          }
          this.trigger('render');
        }
        return this;
      },

      maps: function () {
        var mapDiv = this.$el.find('[class=googlemap]');
        var script;

        if (mapDiv.length !== 0) {
          // this.$el.append('<style type='text/css'>.googlemap { width: 100%; height: 360px; }</style>');
          // this.$el.append('<script src='/_BICv3_/js/gMaps.js'></script>');
          if (mapDiv.attr('data-marker-title') !== undefined) {
          // Address Map
            window.BMP.BIC.mapCallback = this.addressMap;
          } else if (mapDiv.attr('data-kml') !== undefined) {
          // KML Map
            window.BMP.BIC.mapCallback = this.kmlMap;
          } else if (mapDiv.attr('data-map-action') !== undefined) {
          // Directions Map
            window.BMP.BIC.mapCallback = this.directionsMap;
          } else {
          // Basic Map
            window.BMP.BIC.mapCallback = this.basicMap;
          }

          if (window.google === undefined) {
            script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://maps.googleapis.com/maps/api/js?v=3&sensor=true&callback=window.BMP.BIC.mapCallback';
            $('body').append(script);
          } else {
            window.BMP.BIC.mapCallback();
          }
        }
      },

      blinkAnswerMessages: function (message) {
        var blinkAnswerMessage = this.model.get('content').match(/<!-- blinkAnswerMessage:\{.*\} -->/g);

        if (!message) {
          // First Pass - Extract content
          if ($.type(blinkAnswerMessage) === 'array') {
            _.each(blinkAnswerMessage, function (element) {
              this.blinkAnswerMessages(element.substring(24, element.length - 4));
            }, this);
          }
        } else {
          // Process a given message
          message = JSON.parse(message);
          if (typeof message.mojotarget === 'string') {
            if (typeof message.mojoxml === 'string') {
              // Add a DS
              app.datasuitcases.create({
                _id: message.mojotarget,
                data: message.mojoxml
              });
            } else if (message.mojodelete !== undefined) {
              // Remove a DS
              app.datasuitcases.remove(message.mojotarget);
            }
          }

          if (message.startype) {
            if (message.clearstars) {
              // Clear all stars?
              app.stars.clear(message.startype);
            }
            if ($.type(message.staroff) === 'array') {
              // Remove specific stars
              _.each(message.staroff, function (element) {
                if (app.stars.get(element)) {
                  app.stars.get(element.toString()).destroy();
                }
              }, this);
            }
            if ($.type(message.staron) === 'array') {
              // Add stars
              _.each(message.staron, function (element) {
                app.stars.create({
                  _id: element.toString(),
                  type: message.startype,
                  state: true
                });
              });
            }
          }
        }
      },

      pendingQueue: function () {
        var pendingView;
        var SubView;
        var view;

        view = this;

        // fetch view (user can override
        SubView = view.constructor.preparePendingQueueSubView();
        pendingView = new SubView({
          el: view.$el
        });

        pendingView.render();
      },

      popup: function (data) {
        var popup$;
        this.$el.append(Mustache.render(popupTemplate, {
          contents: data
        }));
        popup$ = $('#popup').popup().popup('open').one('popupafterclose', function () {
          popup$.remove();
        });
      },

      destroy: function () {
        this.remove();
      },

      processStars: function () {
        var elements = this.$el.find('.blink-starrable');
        if (elements) {
          elements.each(function (index, element) {
            var attrs;
            var model = app.stars.get($(element).data('id'));
            var star;
            if (!model) {
              attrs = $(element).data();
              attrs._id = attrs.id.toString();
              delete attrs.id;
              attrs.state = false;
              model = new StarModel(attrs);
            }
            star = new StarView({
              model: model,
              el: element
            });
            star.render();
          });
        }
      },

      basicMap: function () {
        var options;
        var map;
        var mapDiv = window.BMP.BIC3.view.$el.find('[class=googlemap]');

        options = {
          center: new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')),
          zoom: parseInt(mapDiv.attr('data-zoom'), 10),
          mapTypeId: google.maps.MapTypeId[mapDiv.attr('data-type').toUpperCase()]
        };

        map = new google.maps.Map($('[class=\'googlemap\']')[0], options);

        $(document).bind('pageshow', function () {
          google.maps.event.trigger(map, 'resize');
          map.setCenter(new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')));
        });
      },

      addressMap: function () {
        var geocoder, options, map;
        var mapDiv = window.BMP.BIC3.view.$el.find('[class=googlemap]');

        geocoder = new google.maps.Geocoder();

        options = {
          address: mapDiv.attr('data-marker-title')
        };

        geocoder.geocode(options, function (results) {
          options = {
            center: results[0].geometry.location,
            zoom: parseInt(mapDiv.attr('data-zoom'), 10),
            mapTypeId: google.maps.MapTypeId[mapDiv.attr('data-type').toUpperCase()]
          };
          map = new google.maps.Map($('[class=\'googlemap\']')[0], options);
          $(document).bind('pageshow', function () {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(results[0].geometry.location);
          });
        });
      },

      kmlMap: function () {
        var options, map, kml;
        var mapDiv = window.BMP.BIC3.view.$el.find('[class=googlemap]');

        options = {
          center: new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')),
          zoom: parseInt(mapDiv.attr('data-zoom'), 10),
          mapTypeId: google.maps.MapTypeId[mapDiv.attr('data-type').toUpperCase()]
        };

        map = new google.maps.Map($('[class=\'googlemap\']')[0], options);
        kml = new google.maps.KmlLayer(mapDiv.attr('data-kml'), {preserveViewport: true});
        kml.setMap(map);

        $(document).bind('pageshow', function () {
          google.maps.event.trigger(map, 'resize');
          map.setCenter(new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')));
        });
      },

      directionsMap: function () {
        var options, map, directionsDisplay, directionsService, origin, destination, locationPromise, request, mapDiv;

        mapDiv = window.BMP.BIC3.view.$el.find('[class=googlemap]');

        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsService = new google.maps.DirectionsService();

        options = {
          center: new google.maps.LatLng(-33.873658, 151.206915),
          zoom: 10,
          mapTypeId: google.maps.MapTypeId[mapDiv.attr('data-type').toUpperCase()]
        };

        map = new google.maps.Map($('[class=\'googlemap\']')[0], options);

        directionsDisplay.setPanel($('[class="googledirections"]')[0]);

        $(document).bind('pageshow', function () {
          google.maps.event.trigger(map, 'resize');
          directionsDisplay.setMap(map);
        });

        if (mapDiv.attr('data-destination-address') === undefined || mapDiv.attr('data-origin-address') === undefined) {
          // Set the origin from attributes or GPS
          locationPromise = window.BMP.BIC.getCurrentPosition();
          locationPromise.then(function (location) {
            if (mapDiv.attr('data-origin-address') === undefined) {
              origin = new google.maps.LatLng(location.latitude, location.longitude);
              destination = mapDiv.attr('data-destination-address');
            } else if (mapDiv.attr('data-destination-address') === undefined) {
              origin = mapDiv.attr('data-origin-address');
              destination = new google.maps.LatLng(location.latitude, location.longitude);
            }
            request = {
              origin: origin,
              destination: destination,
              travelMode: google.maps.TravelMode[mapDiv.attr('data-travelmode').toUpperCase()]
            };

            directionsService.route(request, function (result, status) {
              if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(result);
              }
            });
          });
        } else {
          request = {
            origin: mapDiv.attr('data-origin-address'),
            destination: mapDiv.attr('data-destination-address'),
            travelMode: google.maps.TravelMode[mapDiv.attr('data-travelmode').toUpperCase()]
          };

          directionsService.route(request, function (result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(result);
            }
          });
        }

      }
    }, {
      preparePendingQueueSubView: function () {
        var SubView = PendingView;

        if (app.views.FormPending) {
          SubView = app.views.FormPending;
        }
        return SubView;
      }
    });

    window.BMP.geolocation = geolocation;

    window.BMP.BIC.getCurrentPosition = function (options) {
      return new Promise(function (resolve, reject) {
        window.BMP.geolocation.getCurrentPosition()
        .then(function (position) {
          if ($.type(position.coords) === 'object') {
            resolve(position.coords);
          } else {
            reject('GeoLocation error: blank location from browser / device');
          }
        }, function (error) {
          var string;
          // ESLint bug: https://github.com/eslint/eslint/issues/2038
          /* eslint-disable no-duplicate-case */
          switch (error.code) {
            case error.PERMISSION_DENIED:
              string = 'user has not granted permission';
              break;
            case error.PERMISSION_DENIED_TIMEOUT:
              string = 'user did not grant permission in time';
              break;
            case error.POSITION_UNAVAILABLE:
              string = 'unable to determine position';
              break;
            default:
              string = 'unknown error';
          }
          /* eslint-enable no-duplicate-case */
          reject('GeoLocation error: ' + string);
        }, options);
      });
    };

    return InteractionView;
  }
);
