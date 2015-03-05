(function () {
  'use strict';
  var BMP;

  BMP = window.BMP;

  BMP.BlinkGap = {};

  // detect BlinkGap / PhoneGap / Callback
  BMP.BlinkGap.isHere = function () {
    if (window.isBlinkGap || window.cordova) {
      return true;
    }
    if (BMP.BIC && BMP.BIC.isBlinkGap) {
      return true;
    }
    return !!(
      window.PhoneGap &&
      $.type(window.device) === 'object' &&
      window.device instanceof window.Device
    );
  };

  BMP.BlinkGap.isReady = function () {
    return BMP.BlinkGap.isHere() && !!(
      (window.PhoneGap && window.PhoneGap.available) ||
      (window.cordova && window.cordova.available)
    );
  };

  BMP.BlinkGap.hasCamera = function () {
    return BMP.BlinkGap.isHere() && !!(
      (window.Camera && window.Camera.getPicture) ||
      (navigator.camera && navigator.camera.getPicture)
    );
  };

  BMP.BlinkGap.hasTouchDraw = function () {
    return BMP.BlinkGap.isHere() && !!(
      (window.BGTouchDraw && window.BGTouchDraw.getDrawing) ||
      (navigator.bgtouchdraw && navigator.bgtouchdraw.getDrawing)
    );
  };

  BMP.BlinkGap.hasOffline = function () {
    return !!(
      BMP.BlinkGap.isHere() &&
      window.cordova &&
      window.cordova.offline
    );
  };

  BMP.BlinkGap.isOfflineReady = function () {
    return !!(
      BMP.BlinkGap.isReady() &&
      BMP.BlinkGap.hasOffline() &&
      window.cordova.offline.available
    );
  };

  BMP.BlinkGap.waitForOffline = function (onSuccess, onError) {
    var stopPolling, timeout;
    timeout = setTimeout(function () {
      if (!BMP.BlinkGap.isOfflineReady() && stopPolling) {
        stopPolling();
        onError(new Error('no cordova.offline.available after 5 seconds'));
      }
    }, 5e3);
    stopPolling = pollUntil(BMP.BlinkGap.isOfflineReady, 197, function () {
      clearTimeout(timeout);
      onSuccess();
    });
  };

  /**
   * @return {jQueryPromise}
   */
  BMP.BlinkGap.whenReady = function () {
    var dfrd, start, checkFn, readyHandler;

    dfrd = new $.Deferred();
    start = new Date();

    readyHandler = function () {
      document.removeEventListener('deviceready', readyHandler, false);
      dfrd.resolve();
    };

    checkFn = function () {
      if (BMP.BlinkGap.isHere()) {
        if (BMP.BlinkGap.isReady()) {
          dfrd.resolve();
        } else if (document.addEventListener) {
          document.addEventListener('deviceready', readyHandler, false);
        }
      } else if (($.now() - start) > 10 * 1000) {
        dfrd.reject(new Error('waitForBlinkGap(): still no PhoneGap after 10 seconds'));
      } else {
        setTimeout(checkFn, 197);
      }
    };

    checkFn();

    return dfrd.promise();
  };

}());

(function () {
  'use strict';

  if (!BMP.BlinkGap.hasOffline()) {
    return; // don't bother with this
  }

  function getInitialOrigin() {
    var match;
    if (!BMP.BlinkGap.hasOffline()) {
      throw new Error('no offline cordova plugin');
    }
    if (!cordova.offline.initialURL || typeof cordova.offline.initialURL !== 'string') {
      throw new Error('offline cordova plugin did not supply initialURL');
    }
    match = cordova.offline.initialURL.match(/(https?:\/\/[^\/]+)/);
    if (!match) {
      throw new Error('initialURL was malformed and could not be parsed');
    }
    return match[1];
  }

  /**
   * @class wrapper to facilitate more convenient use of cordova.offline
   */
  function BGOffline() {
    this.plugin = window.cordova.offline;
    this.urlsMap = {};
    return this;
  }

  BGOffline.prototype.populateURLsMap = function (onSuccess, onError) {
    var me = this;
    BMP.BlinkGap.waitForOffline(function () {
      me.plugin.listResources(function (list) {
        me.urlsMap = list;
        onSuccess();
      }, function (err) {
        onError(err);
      });
    }, function (err) {
      onError(err);
    });
  };

  BGOffline.prototype.getURL = function (onlineURL) {
    var offlineURL;
    offlineURL = this.urlsMap[onlineURL];
    if (onlineURL.indexOf('//') === 0) {
      if (!offlineURL) {
        offlineURL = this.urlsMap['https:' + onlineURL];
      }
      if (!offlineURL) {
        offlineURL = this.urlsMap['http:' + onlineURL];
      }
    } else if (onlineURL.indexOf('/') === 0) {
      onlineURL = getInitialOrigin() + onlineURL;
      offlineURL = this.urlsMap[onlineURL];
    }
    return offlineURL;
  };

  BMP.BlinkGap.offline = new BGOffline();
}());
