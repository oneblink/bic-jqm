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
