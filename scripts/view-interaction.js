/*global google: true */
define(
  ['text!template-interaction.mustache', 'text!template-inputPrompt.mustache', 'view-form', 'model-application', 'text!template-category-list.mustache', 'model-star', 'text!template-pending.mustache', 'view-star', 'text!template-popup.mustache', 'text!template-clear-confirmation-popup.mustache'],
  function (Template, inputPromptTemplate, FormView, app, categoryTemplate, StarModel, pendingTemplate, StarView, popupTemplate, clearConfirmationPopupTemplate) {
    "use strict";
    var InteractionView = Backbone.View.extend({

      initialize: function () {
        $('body').append(this.$el);
        window.BMP.BIC.view = this;

        // this.$el.once("pageremove", function () {
        //   console.log("Backbone view cleanup");

        // })
      },

      events: {
        // Old Blink Link Shortcut Methods
        "click [keyword]" : "blinklink",
        "click [interaction]" : "blinklink",
        "click [category]" : "blinklink",
        "click [masterCategory]" : "blinklink",
        "click [back]" : "back",
        "click [home]" : "home",
        "click [login]" : "blinklink",
        "click [pending]" : "pendingQueue",

        // Form Actions
        "click #queue" : "pendingQueue",
        "click .clearPendingItem": "clearPendingItem",
        "click #submitPendingItems": "submitPendingItems",
        "click #clearPendingItems": "clearPendingItems",
        "click #clearPendingItemsConfirmation": "clearPendingItemsConfirmation",

        // Destroy
        "pageremove" : "destroy"
      },

      attributes: {
        "data-role": "page"
      },

      blinklink: function (e) {
        e.preventDefault();

        var $element,
          location,
          attributes = "",
          first = true,
          count,
          path,
          pathParts;

        if (e.target.tagName !== 'A') {
          $element = $(e.target).parents('a');
        } else {
          $element = $(e.target);
        }

        location = "";
        if ($element.attr("keyword")) {
          location = $element.attr("keyword");
        } else if ($element.attr("interaction")) {
          location = $element.attr("interaction");
        } else if ($element.attr("category")) {
          location = $element.attr("category");
        } else if ($element.attr("masterCategory")) {
          location = $element.attr("masterCategory");
        } else if ($element.attr("home") === "") {
          location = app.get("siteName");
        } else if ($element.attr("login") === "") {
          if (app.has("loginAccess") && app.has("loginUseInteractions") && app.has("loginUseInteractions") && app.has("loginPromptInteraction")) {
            location = app.get("loginPromptInteraction");
          } else {
            location = app.get("siteName");
          }
        }

        for (count = 0; count < $element[0].attributes.length; count = count + 1) {
          if ($element[0].attributes[count].name.substr(0, 1) === "_") {
            if (!first) {
              attributes += "&args[" + $element[0].attributes[count].name.substr(1) + "]=" + $element[0].attributes[count].value;
            } else {
              first = false;
              attributes = "/?args[" + $element[0].attributes[count].name.substr(1) + "]=" + $element[0].attributes[count].value;
            }
          }
        }

        path = '';
        pathParts = $.mobile.path.parseLocation().pathname;
        if (window.cordova && window.cordova.offline && window.cordova.offline.available && pathParts.indexOf(window.cordova.offline.filePathPrex) !== -1) {
          // Remove file path
          pathParts = pathParts.substr(pathParts.indexOf(window.cordova.offline.filePathPrex) + window.cordova.offline.filePathPrex.length + 1);
          // Remove domain info
          pathParts = pathParts.substr(pathParts.indexOf('/'));
          // Remove file suffix
          pathParts = pathParts.substr(0, pathParts.indexOf('.'));
        }
        pathParts = pathParts.split('/');
        pathParts.shift();
        if (pathParts[pathParts.length - 1] === "") {
          pathParts.pop();
        }

        if (pathParts[0] === 'offlineData' && pathParts[1] === window.initialURLHashed) {
          pathParts.pop();
          pathParts[0] = window.BMP.BIC.siteVars.answerSpace;
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
        $.mobile.changePage('/' + app.get("siteName"));
      },

      render: function (data) {
        var form,
          rawform,
          inheritedAttributes = this.model.inherit({}),
          view = this;

        // Non-type specific
        if (_.has(inheritedAttributes, "themeSwatch")) {
          this.$el.attr("data-theme", inheritedAttributes.themeSwatch);
        }

        // Input Prompt
        if (this.model.has("inputPrompt") && !(this.model.has("args"))) {
          rawform = this.model.get("inputPrompt");
          if (rawform.substr(0, 6) === "<form>") {
            form = rawform;
          } else {
            form = Mustache.render(inputPromptTemplate, {inputs: rawform});
          }
          this.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: form
          }));
          this.trigger("render");
        } else if (view.model.has("type") && view.model.get("type") === "xslt") {
          // XSLT
          view.model.once("change:content", function () {
            if (typeof view.model.get("content") === 'object') {
              view.$el.html(Mustache.render(Template, {
                header: inheritedAttributes.header,
                footer: inheritedAttributes.footer,
                content: ''
              }));
              view.$el.children('[data-role=content]')[0].appendChild(view.model.get("content"));
              view.processStars();
              view.trigger("render");
            } else if (typeof view.model.get("content") === 'string') {
              view.$el.html(Mustache.render(Template, {
                header: inheritedAttributes.header,
                footer: inheritedAttributes.footer,
                content: view.model.get("content")
              }));
              view.trigger("render");
            } else {
              view.$el.html(Mustache.render(Template, {
                header: inheritedAttributes.header,
                footer: inheritedAttributes.footer,
                content: "Unknown error rendering XSLT interaction."
              }));
              view.trigger("render");
            }
          });
          this.model.performXSLT();
        } else if (this.model.has("type") && this.model.get("type") === "form") {
          if ($('#ActiveFormContainer').length > 0) {
            $('#ActiveFormContainer').attr('id', 'FormContainer');
          }

          // Form
          view.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer
          }));

          view.subView = new FormView({
            model: view.model,
            el: view.$el.children('[data-role="content"]')
          });

          view.listenToOnce(view.subView, 'render', function () {
            view.trigger('render');
          });

          view.subView.render();

        } else if (this.model.id.toLowerCase() === window.BMP.BIC.siteVars.answerSpace.toLowerCase()) {
          // Home Screen
          view.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: Mustache.render(categoryTemplate, {
              models: view.model.get("interactionList"),
              path: data.dataUrl.substr(-1) === '/' ? data.dataUrl : data.dataUrl + '/'
            })
          }));
          view.trigger("render");
        } else if (!this.model.has("type")) {
          // Category
          view.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: Mustache.render(categoryTemplate, {
              models: _.map(_.filter(app.interactions.models, function (value) {
                return value.get("display") !== "hide" && _.filter(value.get("tags"), function (element) {
                  return element === 'nav-' + this.model.id.toLowerCase();
                }, this).length > 0;
              }, view), function (value) {
                return value.attributes;
              }),
              path: data.dataUrl.substr(-1) === '/' ? data.dataUrl : data.dataUrl + '/'
            })
          }));
          view.trigger("render");
        } else if (this.model.get("type") === "message") {
          this.$el.html(Mustache.render(Template, {
            header: inheritedAttributes.header,
            footer: inheritedAttributes.footer,
            content: inheritedAttributes.message
          }));
          this.trigger("render");
        } else {
          // MADL, others
          this.$el.html(Mustache.render(Template, inheritedAttributes));
          if (this.model.has("content")) {
            this.blinkAnswerMessages();
            this.maps();
            this.processStars();
          }
          this.trigger("render");
        }
        return this;
      },

      maps: function () {
        var mapDiv = this.$el.find("[class=googlemap]"), script;

        if (mapDiv.length !== 0) {
          //this.$el.append('<style type="text/css">.googlemap { width: 100%; height: 360px; }</style>');
          //this.$el.append('<script src="/_BICv3_/js/gMaps.js"></script>');
          if (mapDiv.attr('data-marker-title') !== undefined) {
          // Address Map
            window.BMP.BIC3.MapCallback = this.addressMap;
          } else if (mapDiv.attr('data-kml') !== undefined) {
          // KML Map
            window.BMP.BIC3.MapCallback = this.kmlMap;
          } else if (mapDiv.attr('data-map-action') !== undefined) {
          // Directions Map
            window.BMP.BIC3.MapCallback = this.directionsMap;
          } else {
          // Basic Map
            window.BMP.BIC3.MapCallback = this.basicMap;
          }

          if (window.google === undefined) {
            script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://maps.googleapis.com/maps/api/js?v=3&sensor=true&callback=window.BMP.BIC3.MapCallback";
            $('body').append(script);
          } else {
            window.BMP.BIC3.MapCallback();
          }
        }
      },

      blinkAnswerMessages: function (message) {
        if (!message) {
          // First Pass - Extract content

          /*jslint regexp: true */
          var blinkAnswerMessage = this.model.get('content').match(/<!-- blinkAnswerMessage:\{.*\} -->/g);
          /*jslint regexp: false */

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
        //var el = $('#pendingContent');
        var pendingExtractor = function (status) {
          return _.map(app.pending.where({status: status}), function (pendingItem) {
            var pendingAttrs = _.clone(pendingItem.attributes);
            if (!pendingAttrs._id) {
              pendingAttrs._id = pendingItem.cid;
            }
            pendingAttrs.editInteraction = app.interactions.where({
              blinkFormObjectName: pendingItem.get("name"),
              blinkFormAction: pendingItem.get("action")
            });
            if (pendingAttrs.editInteraction && pendingAttrs.editInteraction.length > 0) {
              pendingAttrs.editInteraction = pendingAttrs.editInteraction[0].id;
            } else {
              pendingAttrs.editInteraction = null;
            }
            if (!pendingAttrs.label) {
              pendingAttrs.label = pendingAttrs.name;
            }
            return pendingAttrs;
          });
        };

        this.$el.append(Mustache.render(pendingTemplate, {
          pending: pendingExtractor('Pending'),
          pendingPresent: pendingExtractor('Pending').length > 0,
          draft: pendingExtractor('Draft'),
          draftPresent: pendingExtractor('Draft').length > 0,
          validation: pendingExtractor('Failed Validation'),
          validationPresent: pendingExtractor('Failed Validation').length > 0
        }));
        this.$el.trigger('pagecreate');
        $('#pendingPopup').one('popupafterclose', function () {
          $('#pendingPopup').remove();
        });
        $('#pendingPopup').popup('open');
      },

      clearPendingItem: function (e) {
        var $element, popup = $('#pendingPopup');

        if (e.target.tagName !== 'A') {
          $element = $(e.target).parents('a');
        } else {
          $element = $(e.target);
        }

        app.pending.get($element[0].attributes._pid.value).destroy();
        popup.popup('close');
      },

      submitPendingItems: function () {
        var popup = $('#pendingPopup');
        $.mobile.loading('show');
        app.pending.processQueue()
          .then(null, function () {
            return null;
          })
          .then(function () {
            popup.one('popupafterclose', function () {
              $.mobile.loading('hide');
            });
            popup.popup('close');
          });
      },

      clearPendingItems: function () {
        var items, popup = $('#clearConfirmationPopup'), i;
        items = app.pending.where({status: 'Draft'});
        for (i = 0; i < items.length; i = i + 1) {
          items[i].destroy();
        }
        popup.one('popupafterclose', function () {
          popup.remove();
        });
        popup.popup('close');
      },

      clearPendingItemsConfirmation: function () {
        var pendingPopup = $('#pendingPopup');

        pendingPopup.one('popupafterclose', function () {
          $('#clearConfirmationPopup').popup({
            afterclose: function () {
              $('#clearConfirmationPopup').remove();
            }
          });
          setInterval(function () {
            $('#clearConfirmationPopup').popup('open');
          }, 100);
        });

        this.$el.append(Mustache.render(clearConfirmationPopupTemplate, {}));
        this.$el.trigger('pagecreate');
        pendingPopup.popup('close');
      },

      popup: function (data) {
        this.$el.append(Mustache.render(popupTemplate, {
          contents: data
        }));
        this.$el.trigger('pagecreate');
        $('#popup').popup('open');
      },

      destroy: function () {
        this.remove();
      },

      processStars: function () {
        var elements = this.$el.find('.blink-starrable');
        if (elements) {
          /*jslint unparam: true*/
          elements.each(function (index, element) {
            var attrs,
              model = app.stars.get($(element).data('id')),
              star;
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
          /*jslint unparam: false*/
        }
      },



      basicMap: function () {
        var options, map, mapDiv = window.BMP.BIC3.view.$el.find("[class=googlemap]");

        options = {
          center: new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')),
          zoom: parseInt(mapDiv.attr('data-zoom'), 10),
          mapTypeId: google.maps.MapTypeId[mapDiv.attr('data-type').toUpperCase()]
        };

        map = new google.maps.Map($("[class=\'googlemap\']")[0], options);

        $(document).bind("pageshow", function () {
          google.maps.event.trigger(map, "resize");
          map.setCenter(new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')));
        });
      },

      addressMap: function () {
        var geocoder, options, map, mapDiv = window.BMP.BIC3.view.$el.find("[class=googlemap]");

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
          map = new google.maps.Map($("[class=\'googlemap\']")[0], options);
          $(document).bind("pageshow", function () {
            google.maps.event.trigger(map, "resize");
            map.setCenter(results[0].geometry.location);
          });
        });
      },

      kmlMap: function () {
        var options, map, kml, mapDiv = window.BMP.BIC3.view.$el.find("[class=googlemap]");

        options = {
          center: new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')),
          zoom: parseInt(mapDiv.attr('data-zoom'), 10),
          mapTypeId: google.maps.MapTypeId[mapDiv.attr('data-type').toUpperCase()]
        };

        map = new google.maps.Map($("[class=\'googlemap\']")[0], options);
        kml = new google.maps.KmlLayer(mapDiv.attr('data-kml'), {preserveViewport: true});
        kml.setMap(map);

        $(document).bind("pageshow", function () {
          google.maps.event.trigger(map, "resize");
          map.setCenter(new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')));
        });
      },

      directionsMap: function () {
        var options, map, directionsDisplay, directionsService, origin, destination, locationPromise, request, getGeoLocation, mapDiv;

        mapDiv = window.BMP.BIC3.view.$el.find("[class=googlemap]");

        getGeoLocation = function (options) {
          var defaultOptions = {
              enableHighAccuracy: true,
              maximumAge: 5 * 60 * 1000, // 5 minutes
              timeout: 5 * 1000 // 5 seconds
            };
          options = $.extend({}, defaultOptions, $.isPlainObject(options) ? options : {});

          return new Promise(function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(function (position) {
              var coords = position.coords;
              if ($.type(coords) === 'object') {
                resolve(coords);
              } else {
                reject('GeoLocation error: blank location from browser / device');
              }
            }, function (error) {
              var string;
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
              reject('GeoLocation error: ' + string);
            }, options);
          });
        };

        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsService = new google.maps.DirectionsService();

        options = {
          center: new google.maps.LatLng(-33.873658, 151.206915),
          zoom: 10,
          mapTypeId: google.maps.MapTypeId[mapDiv.attr('data-type').toUpperCase()]
        };

        map = new google.maps.Map($("[class=\'googlemap\']")[0], options);

        directionsDisplay.setPanel($("[class='googledirections']")[0]);

        $(document).bind("pageshow", function () {
          google.maps.event.trigger(map, "resize");
          directionsDisplay.setMap(map);
        });

        if (mapDiv.attr('data-destination-address') === undefined || mapDiv.attr('data-origin-address') === undefined) {
          // Set the origin from attributes or GPS
          locationPromise = getGeoLocation();
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
    });

    return InteractionView;
  }
);
