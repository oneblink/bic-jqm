directionsMap: function () {
        var options, map, directionsDisplay, directionsService, origin, destination, locationPromise, request, getGeoLocation, mapDiv = window.BMP.BIC3.view.$el.find("[class=googlemap]");

        getGeoLocation = function(options) {
          var dfrd = new $.Deferred(),
            defaultOptions = {
              enableHighAccuracy: true,
              maximumAge: 5 * 60 * 1000, // 5 minutes
              timeout: 5 * 1000 // 5 seconds
            };
          options = $.extend({}, defaultOptions, $.isPlainObject(options) ? options : {});
          navigator.geolocation.getCurrentPosition(function(position) {
            var coords = position.coords;
            if ($.type(coords) === 'object') {
              dfrd.resolve(coords);
            } else {
              dfrd.reject('GeoLocation error: blank location from browser / device');
            }
          }, function(error) {
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
            dfrd.reject('GeoLocation error: ' + string);
          }, options);
          return dfrd.promise();
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

        $(document).bind("pageshow", function() {
          google.maps.event.trigger(map, "resize");
          directionsDisplay.setMap(map);
        });

        if (mapDiv.attr('data-destination-address') === undefined || mapDiv.attr('data-origin-address') === undefined) {
          // Set the origin from attributes or GPS
          locationPromise = getGeoLocation();
          locationPromise.done(function(location) {
            if (mapDiv.attr('data-origin-address') === undefined) {
              origin = new google.maps.LatLng(location.latitude, location.longitude);
              destination = mapDiv.attr('data-destination-address');
            } else if (mapDiv.attr('data-destination-address') === undefined) {
              origin = mapDiv.attr('data-origin-address');
              destination = new google.maps.LatLng(location.latitude, location.longitude);
            }
            var request = {
              origin: origin,
              destination: destination,
              travelMode: google.maps.TravelMode[mapDiv.attr('data-travelmode').toUpperCase()]
            };

            directionsService.route(request, function(result, status) {
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

          directionsService.route(request, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(result);
            }
          });
        }

      },

