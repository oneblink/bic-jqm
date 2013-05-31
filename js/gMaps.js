// Loads up a basic map
function gmapinit() {
    var mapOptions;
    var mapdiv = $("[class='googlemap']");
    var map;

    if (typeof mapdiv.attr('data-marker-title') !== 'undefined'){
        // Address Map
        var geocoder = new google.maps.Geocoder();

        var options = {
            address: mapdiv.attr('data-marker-title')
        };
        
        geocoder.geocode(options, function(results, status) {
            mapOptions = {
                center: results[0].geometry.location,
                zoom: parseInt(mapdiv.attr('data-zoom'), 10),
                mapTypeId: google.maps.MapTypeId[mapdiv.attr('data-type').toUpperCase()]
            };
            map = new google.maps.Map($("[class=\'googlemap\']")[0], mapOptions);
            $(document).bind("pageshow", function(){
                google.maps.event.trigger(map, "resize");
                map.setCenter(results[0].geometry.location);
            });
        });

    } else if (typeof mapdiv.attr('data-kml') !== 'undefined'){
        // KML Map
        mapOptions = {
            center: new google.maps.LatLng(mapdiv.attr('data-latitude'), mapdiv.attr('data-longitude')),
            zoom: parseInt(mapdiv.attr('data-zoom'), 10),
            mapTypeId: google.maps.MapTypeId[mapdiv.attr('data-type').toUpperCase()]
        };

        map = new google.maps.Map($("[class=\'googlemap\']")[0], mapOptions);
        kml = new google.maps.KmlLayer(mapdiv.attr('data-kml'), {map: map, preserveViewport: true});
        
        $(document).bind("pageshow", function(){
            google.maps.event.trigger(map, "resize");
            map.setCenter(new google.maps.LatLng(mapdiv.attr('data-latitude'), mapdiv.attr('data-longitude')));
        });
    
    } else if (typeof mapdiv.attr('data-map-action') !== 'undefined'){
        // Directions Map
        var directionsDisplay = new google.maps.DirectionsRenderer();
        var directionsService = new google.maps.DirectionsService();

        mapOptions = {
            center: new google.maps.LatLng(-33.873658,151.206915),
            zoom: 10,
            mapTypeId: google.maps.MapTypeId[mapdiv.attr('data-type').toUpperCase()]
        };

        map = new google.maps.Map($("[class=\'googlemap\']")[0], mapOptions);
        
        directionsDisplay.setPanel($("[class='googledirections']")[0]);
        
        $(document).bind("pageshow", function(){
            google.maps.event.trigger(map, "resize");
            directionsDisplay.setMap(map);
        });

        var origin, destination;


        if (typeof mapdiv.attr('data-destination-address') === 'undefined' || typeof mapdiv.attr('data-origin-address') === 'undefined') {
            // Set the origin from attributes or GPS
            var locationPromise = getGeoLocation();
            locationPromise.done(function(location){
                if (typeof mapdiv.attr('data-origin-address') === 'undefined'){
                    origin = new google.maps.LatLng(location.latitude, location.longitude);
                    destination = mapdiv.attr('data-destination-address');
                } else if (typeof mapdiv.attr('data-destination-address') === 'undefined') {
                    origin = mapdiv.attr('data-origin-address');
                    destination = new google.maps.LatLng(location.latitude, location.longitude);
                }
                console.log(location);
                var request = {
                    origin: origin,
                    destination: destination,
                    travelMode: google.maps.TravelMode[mapdiv.attr('data-travelmode').toUpperCase()]
                  };

                directionsService.route(request, function(result, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(result);
                    } else {
                        console.log('We have a problem');
                    }
                });
            });
            locationPromise.fail(function(ex){
              console.log("Could not determine location: " + ex);
            });
        } else {
            var request = {
                origin: mapdiv.attr('data-origin-address'),
                destination: mapdiv.attr('data-destination-address'),
                travelMode: google.maps.TravelMode[mapdiv.attr('data-travelmode').toUpperCase()]
              };

            directionsService.route(request, function(result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(result);
                } else {
                    console.log('We have a problem');
                }
            });
        }
    
    } else {
        // Basic Map
        mapOptions = {
            center: new google.maps.LatLng(mapdiv.attr('data-latitude'), mapdiv.attr('data-longitude')),
            zoom: parseInt(mapdiv.attr('data-zoom'), 10),
            mapTypeId: google.maps.MapTypeId[mapdiv.attr('data-type').toUpperCase()]
        };

        map = new google.maps.Map($("[class=\'googlemap\']")[0], mapOptions);
        
        $(document).bind("pageshow", function(){
            google.maps.event.trigger(map, "resize");
            map.setCenter(new google.maps.LatLng(mapdiv.attr('data-latitude'), mapdiv.attr('data-longitude')));
        });
    }
}

// Loads Google Maps API, if needed
if (typeof google === 'undefined'){
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://maps.googleapis.com/maps/api/js?v=3&sensor=true&callback=gmapinit";
    $("[class='googlemap']").parent().append(script);
} else {
    gmapinit();
}


getGeoLocation = function(options) {
    var dfrd = new $.Deferred(),
    defaultOptions = {
      enableHighAccuracy: true,
      maximumAge: 5 * 60 * 1000, // 5 minutes
      timeout: 5 * 1000 // 5 seconds
    };
    options = $.extend({}, defaultOptions, $.isPlainObject(options) ? options : {});
    navigator.geolocation.getCurrentPosition(
      function(position) { // successCallback
        var coords = position.coords;
        if ($.type(coords) === 'object') {
          dfrd.resolve(coords);
        } else {
          dfrd.reject('GeoLocation error: blank location from browser / device');
        }
      },
      function(error) { // errorCallback
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
      },
      options);
    return dfrd.promise();
  };
