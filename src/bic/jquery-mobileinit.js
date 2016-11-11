define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');

  // this module

  var isFileProtocol = !!~['file:', 'ms-appx:', 'ms-appx-web:'].indexOf(window.location.protocol);

  $(document).on('mobileinit', function () {
    $.extend($.mobile, {
      pushStateEnabled: !isFileProtocol
    });
  });
});
