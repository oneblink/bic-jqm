      basicMap: function () {
        var options, map, mapDiv = window.BMP.BIC3.view.$el.find("[class=googlemap]");

        options = {
          center: new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')),
          zoom: parseInt(mapDiv.attr('data-zoom'), 10),
          mapTypeId: google.maps.MapTypeId[mapDiv.attr('data-type').toUpperCase()]
        };

        map = new google.maps.Map($("[class=\'googlemap\']")[0], options);

        $(document).bind("pageshow", function() {
          google.maps.event.trigger(map, "resize");
          map.setCenter(new google.maps.LatLng(mapDiv.attr('data-latitude'), mapDiv.attr('data-longitude')));
        });
      },
