      addressMap: function () {
        var geocoder, options, map, mapDiv = window.BMP.BIC3.view.$el.find("[class=googlemap]");

        geocoder = new google.maps.Geocoder();

        options = {
          address: mapDiv.attr('data-marker-title')
        };

        geocoder.geocode(options, function(results) {
          options = {
            center: results[0].geometry.location,
            zoom: parseInt(mapDiv.attr('data-zoom'), 10),
            mapTypeId: google.maps.MapTypeId[mapDiv.attr('data-type').toUpperCase()]
          };
          map = new google.maps.Map($("[class=\'googlemap\']")[0], options);
          $(document).bind("pageshow", function() {
            google.maps.event.trigger(map, "resize");
            map.setCenter(results[0].geometry.location);
          });
        });
      },
