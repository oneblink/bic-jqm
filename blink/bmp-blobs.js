/*global define:true, require:true*/ // require.js
/*jslint indent:2*/
/*jslint browser:true nomen:true*/

(function (window) {
  'use strict';

  var BMP = window.BMP,
    URL = {},
    generateUUID,
    blobs = {}; // in-memory storage

  /**
   * @param {Blob} blob object to store.
   * @param {Object} [options] optional parameters with 'autoRevoke' attribute.
   * @returns {String} Blob URI.
   */
  URL.createObjectURL = function (blob, options) {
    var key = generateUUID(),
      autoRevoke = !!(options && options.autoRevoke) || false;

    blobs[key] = blob;
    // TODO: handle autoRevoke when specification is finalised
    return 'blob:' + key;
  };

  URL.revokeObjectURL = function (uri) {
    var key = uri.replace('blob:', '');
    delete blobs[key];
  };

  /**
   * non-W3C standard, but used for our implementation
   */
  URL.retrieveObject = function (uri) {
    var key = uri.replace('blob:', '');
    return blobs[key];
  };

  /**
   * non-W3C standard, but used for our implementation
   */
  URL.revokeAllObjectURLs = function () {
    blobs = {};
  };

  generateUUID = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      /*jslint bitwise:true*/
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      /*jslint bitwise:false*/
      return v.toString(16);
    });
  };

  window.BMP = window.BMP || {};
  window.BMP.URL = URL;
}(this));

/*jslint indent:2*/
(function (window) {
  'use strict';
  var BMP,
    MIME;

  window.BMP = window.BMP || {};
  BMP = window.BMP;

  BMP.MIME = BMP.MIME || {};
  MIME = BMP.MIME;

  /**
   * @const
   */
  MIME.TEXT_TYPES = [
    'application/javascript',
    'application/json',
    'application/x-javascript'
  ];

  /**
   * @param {String} type e.g. 'image/jpeg'
   * @returns {Boolean}
   */
  MIME.isText = function (type) {
    // TODO: strip type parameters (semi-colon and onwards) ??
    if (type.indexOf('text/') === 0) {
      return true;
    }
    if (MIME.TEXT_TYPES.indexOf(type) !== -1) {
      return true;
    }
    return false;
  };

}(this));

/*jslint indent:2*/
/*jslint browser:true*/
/*jslint nomen:true, plusplus:true*/

(function (window) {
  'use strict';
  var b, isConstructableBlob = true,
    Blob,
    convertArrayBufferToBase64,
    convertStringToArrayBuffer,
    MIME = window.BMP.MIME;

  try {
    b = new window.Blob();
    b = null;
  } catch (err) {
    isConstructableBlob = false;
  }

  // http://stackoverflow.com/questions/9267899
  convertArrayBufferToBase64 = function (buffer) {
    var binary = '',
      bytes = new window.Uint8Array(buffer),
      len = bytes.byteLength,
      i;

    for (i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  /**
   * @constructor
   * @param {Array} [data] contains 1 {String}
   * @param {Object} [options] properties Object with "type" attribute
   */
  Blob = function (data, options) {
    var datum;

    if (data && !Array.isArray(data)) {
      throw new Error('first argument should be an Array');
    }

    options = options || {};

    this.size = 0;
    this.type = '';
    this.base64 = '';
    this.text = '';

    if (typeof options === 'object') {
      this.type = options.type || this.type;
    }

    if (data && data.length) {
      datum = data[0];
      if (typeof datum === 'string') {
        if (datum.indexOf('data:') === 0 && this.type === 'text/plain') {
          this.size += datum.length;
          this.text += datum;
        } else {
          this.size += datum.length;
          this.base64 += datum;
        }
      }
    }

    return this;
  };

  /**
   * cross-browser constructor for Blob
   * @param {Array} data Array of {ArrayBuffer|ArrayBufferView|Blob|String}.
   * @param {Object} [options] optional Object with "type" attribute
   */
  Blob.createNative = function (data, options) {
    var builder;
    options = options || {};
    if (isConstructableBlob) {
      return new window.Blob(data, options);
    }
    if (window.BlobBuilder) {
      builder = new window.BlobBuilder();
      builder.append(data);
      return builder.getBlob(options);
    }
    return new Blob(data, options);
  };

  /**
   * @param {String} url
   * @param {Function} onSuccess function({BMP.Blob} blob)
   * @param {Function} onError function({Error} error)
   */
  Blob.fromBlobURL = function (url, onSuccess, onError) {
    var xhr,
      blob;

    onSuccess = onSuccess || function () {};
    onError = onError || function () {};

    if (!window.URL || !window.URL.createObjectURL) {
      this.fromNativeBlob(window.BMP.URL.retrieveObject(url), function (blob) {
        onSuccess(blob);
      }, function (err) {
        onError(err);
      });

    } else { // native URL.createObjectURL, therefore use XMLHTTPRequest
      Blob.nativelyFromBlobURL(url, onSuccess, onError);
    }
  };

  /**
   * @param {Blob} blob
   * @param {Function} onSuccess function({BMP.Blob} blob)
   * @param {Function} onError function({Error} error)
   */
  Blob.fromNativeBlob = function (blob, onSuccess, onError) {
    var fr = new window.FileReader();

    onSuccess = onSuccess || function () {};
    onError = onError || function () {};

    fr.onload = function (event) {
      var result;
      fr.onload = null;
      try {
        result = event.target.result;
        blob = Blob.fromDataURI(event.target.result);
        if (!blob) {
          throw new Error('Blob.fromNativeBlob: fromDataURI gave no blob');
        }
      } catch (err) {
        onError(err);
        return;
      }
      onSuccess(blob);
    };
    fr.onerror = function (event) {
      fr.onerror = null;
      onError(event.target.error);
    };
    try {
      fr.readAsDataURL(blob);
    } catch (err) {
      fr.onload = null;
      fr.onerror = null;
      onError(err);
    }
  };

  /**
   * @param {String} dataURI
   * @returns {BMP.Blob} not native Blob!
   */
  Blob.fromDataURI = function (dataURI) {
    var parts,
      type,
      encoding,
      data,
      blob = new Blob();

    parts = dataURI.split(','); // 0 => header, 1 => data
    data = parts[1];
    parts = parts[0].split(':'); // 0 => 'data', 1 => type;encoding
    parts = parts[1].split(';'); // 0 => type, 1 => encoding
    type = parts[0];
    encoding = parts[1];

    if (encoding === 'base64') {
      blob.base64 = data;
    } else {
      blob.text = data;
    }
    blob.type = type;
    blob.size = data.length;

    return blob;
  };

  /**
   * @returns {String}
   */
  Blob.prototype.toDataURI = function () {
    var head, uri;
    head = 'data:' + this.type;
    if (this.base64) {
      head += ';base64,';
      uri = head + this.base64;
    } else {
      head += ',';
      uri = head + this.text;
    }
    return uri;
  };

  /**
   * @param {String} url
   * @param {Function} onSuccess function({BMP.Blob} blob)
   * @param {Function} onError function({Error} error)
   */
  Blob.nativelyFromBlobURL = function (url, onSuccess, onError) {
    var xhr,
      blob;

    onSuccess = onSuccess || function () {};
    onError = onError || function () {};

    xhr = new window.XMLHttpRequest();
    xhr.onreadystatechange = function () {
      var mime,
        base64,
        serializer;

      if (this.readyState === window.XMLHttpRequest.DONE) {
        this.onreadystatechange = null;
        mime = this.getResponseHeader('Content-Type');
        if (this.status === 200) {
          if (this.responseType === 'arraybuffer') {
            base64 = convertArrayBufferToBase64(this.response);
            blob = new Blob([base64], { type: mime });

          } else if (this.responseType === 'blob') {
            Blob.fromNativeBlob(this.response, function (blob) {
              onSuccess(blob);
            }, function (err) {
              onError(err);
            });

          } else if (this.responseType === 'document') {
            serializer = new window.XMLSerializer();
            base64 = window.btoa(serializer.serializeToString(this.response));
            blob = new Blob([base64], { type: mime });

          } else if (this.responseType === 'json') {
            base64 = window.btoa(JSON.stringify(this.response));
            blob = new Blob([base64], { type: mime });

          } else { // this.responseType === 'text'
            blob = new Blob([this.response], { type: mime });
          }
          if (blob) {
            onSuccess(blob);
          } else {
            onError(new Error('error retrieving target Blob via Blob URL'));
          }

        } else { // status === 500
          onError(new Error(this.url + ' -> ' + this.status));
        }
      }
    };
    xhr.open('GET', url);
    xhr.send();
  };

  /**
   * @param {BMP.Blob} blob
   */
  Blob.isNested = function () {

  };

  Blob.prototype.decode64 = function () {
    if (!this.text && this.base64 && MIME.isText(this.type)) {
      this.text = window.atob(this.base64);
      this.base64 = null;
    }
  };

  Blob.prototype.encode64 = function () {
    if (this.text && !this.base64) {
      this.base64 = window.btoa(this.text);
      this.text = null;
    }
  };

  /**
   * @returns {Blob} a Base64-encoded BMP.Blob within a Blob
   */
  Blob.prototype.makeNested = function () {
    var dataURI = 'data:';
    dataURI += this.type;
    dataURI += ';base64,';
    dataURI += this.base64;
    this.type = 'text/plain';
    this.text = dataURI;
    this.base64 = null;
  };

  Blob.prototype.undoNested = function () {
    var blob = Blob.fromDataURI(this.text);
    this.type = blob.type;
    this.base64 = blob.base64;
    this.text = null;
  };

  Blob.prototype.toNative = function () {
    return window.BMP.Blob.createNative([window.atob(this.base64)], {
      type: this.type
    });
  };

  window.BMP = window.BMP || {};
  window.BMP.Blob = Blob;
}(this));

/*jslint browser:true, indent:2, nomen:true*/
/*global $, _*/
(function (window) {
  'use strict';
  var BMP,
    FileInput;

  window.BMP = window.BMP || {};
  BMP = window.BMP;

  /**
   * @param {jQuery|Element} element to be enhanced.
   * @constructor
   */
  FileInput = function (element) {
    if (element instanceof $ && element.length === 1) {
      this.$el = element;
      this.el = this.$el[0];
    } else if (_.isElement(element)) {
      this.el = element;
      this.$el = $(this.el);
    } else {
      throw new Error('BMP.FileInput constructor expects a single DOM Element');
    }
    return this;
  };

  FileInput.prototype.size = function () {
    if (this.el && this.$el.val() && this.el.files) {
      return this.el.files.length;
    }
    return 0;
  };

  /**
   * @param {Number} [index] of the requested file, defaults to 0
   * @returns {Blob}
   */
  FileInput.prototype.getNativeBlob = function (index) {
    var size;
    if (!index || !_.isNumber(index)) {
      index = 0;
    }
    size = this.size();
    if (size <= index) {
      throw new RangeError('targetIndex: ' + index + '; size:' + size);
    }
    return this.el.files[index];
  };

  /**
   * returns (via Promise) a BMP.Blob
   * @param {Number} [index] of the requested file, defaults to 0
   * @returns {Promise}
   */
  FileInput.prototype.getBlob = function (index) {
    var dfrd = new $.Deferred();
    BMP.Blob.fromNativeBlob(this.getNativeBlob(index), function (blob) {
      dfrd.resolve(blob);
    }, dfrd.reject);
    return dfrd.promise();
  };

  /**
   * establishes event-handlers
   */
  FileInput.initialize = function () {
    $(document.body).on('click', 'input[type=file]', FileInput.onClick);
  };

  FileInput.onClick = function () {
    var $this = $(this);
    if (!$this.data('fileInput')) {
      $this.data('fileInput', new FileInput(this));
    }
  };

  BMP.FileInput = FileInput;

}(this));
