// see MIT/GPL http://phpjs.org/ for the original source of these functions

/*jslint browser:true*/ // assume "window" and other browser globals
/*jslint white:true*/ // ignore white-space issues
/*global define:true, require:true*/ // globals from Require.JS

/*jslint plusplus:true, bitwise:true, regexp:true*/

define([], function() {
  'use strict';
  /**
   * @constructor
   */
  var PHP = {};

  PHP.explode = function(delimiter, string, limit) {
      // Splits a string on string separator and return array of components. If limit is positive only limit number of components is returned. If limit is negative all components except the last abs(limit) are returned.  
      // 
      // version: 1103.1210
      // discuss at: http://phpjs.org/functions/explode
      // +     original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +     improved by: kenneth
      // +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +     improved by: d3x
      // +     bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // *     example 1: explode(' ', 'Kevin van Zonneveld');
      // *     returns 1: {0: 'Kevin', 1: 'van', 2: 'Zonneveld'}
      // *     example 2: explode('=', 'a=bc=d', 2);
      // *     returns 2: ['a', 'bc=d']
      var emptyArray = {
          0: ''
      },
      splitted,
      partA, partB;
      /* END: var */

      // third argument is not required
      if (arguments.length < 2 || typeof delimiter === 'undefined' || typeof string === 'undefined') {
          return null;
      }

      if (delimiter === '' || delimiter === false || delimiter === null) {
          return false;
      }

      if (typeof delimiter === 'function' || typeof delimiter === 'object' || typeof string === 'function' || typeof string === 'object') {
          return emptyArray;
      }

      if (delimiter === true) {
          delimiter = '1';
      }

      if (!limit) {
          return string.toString().split(delimiter.toString());
      } else {
          // support for limit argument
          splitted = string.toString().split(delimiter.toString());
          partA = splitted.splice(0, limit - 1);
          partB = splitted.join(delimiter.toString());
          partA.push(partB);
          return partA;
      }
  };

  PHP.utf8_encode = function(argString) {
      // http://kevin.vanzonneveld.net
      // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: sowberry
      // +    tweaked by: Jack
      // +   bugfixed by: Onno Marsman
      // +   improved by: Yves Sucaet
      // +   bugfixed by: Onno Marsman
      // +   bugfixed by: Ulrich
      // +   bugfixed by: Rafal Kukawski
      // *     example 1: utf8_encode('Kevin van Zonneveld');
      // *     returns 1: 'Kevin van Zonneveld'

      if (argString === null || typeof argString === "undefined") {
          return "";
      }

      var string = String(argString), // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      utftext = "",
      start, end, stringl = 0,
      n, c1, enc;
      /* END: var */

      start = end = 0;
      stringl = string.length;
      for (n = 0; n < stringl; n++) {
          c1 = string.charCodeAt(n);
          enc = null;

          if (c1 < 128) {
              end++;
          } else if (c1 > 127 && c1 < 2048) {
              enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
          } else {
              enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
          }
          if (enc !== null) {
              if (end > start) {
                  utftext += string.slice(start, end);
              }
              utftext += enc;
              start = end = n + 1;
          }
      }

      if (end > start) {
          utftext += string.slice(start, stringl);
      }

      return utftext;
  };

  PHP.sha1 = function(str) {
      // http://kevin.vanzonneveld.net
      // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
      // + namespaced by: Michael White (http://getsprink.com)
      // +      input by: Brett Zamir (http://brett-zamir.me)
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // -    depends on: utf8_encode
      // *     example 1: sha1('Kevin van Zonneveld');
      // *     returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'
      var rotate_left = function (n, s) {
          var t4 = (n << s) | (n >>> (32 - s));
          return t4;
      },
      /**
       * @inner
       */ 
      cvt_hex = function (val) {
          var str = "",
          i, v;

          for (i = 7; i >= 0; i--) {
              v = (val >>> (i * 4)) & 0x0f;
              str += v.toString(16);
          }
          return str;
      },

      blockstart,
      i, j,
      W = new Array(80),
      H0 = 0x67452301,
      H1 = 0xEFCDAB89,
      H2 = 0x98BADCFE,
      H3 = 0x10325476,
      H4 = 0xC3D2E1F0,
      A, B, C, D, E,
      temp,
      str_len,
      word_array = [];
      /* END: var */

      str = PHP.utf8_encode(str);
      str_len = str.length;

      for (i = 0; i < str_len - 3; i += 4) {
          j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
          word_array.push(j);
      }

      switch (str_len % 4) {
      case 0:
          i = 0x080000000;
          break;
      case 1:
          i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
          break;
      case 2:
          i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
          break;
      case 3:
          i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) << 8 | 0x80;
          break;
      }

      word_array.push(i);

      while ((word_array.length % 16) !== 14) {
          word_array.push(0);
      }

      word_array.push(str_len >>> 29);
      word_array.push((str_len << 3) & 0x0ffffffff);

      for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
          for (i = 0; i < 16; i++) {
              W[i] = word_array[blockstart + i];
          }
          for (i = 16; i <= 79; i++) {
              W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
          }


          A = H0;
          B = H1;
          C = H2;
          D = H3;
          E = H4;

          for (i = 0; i <= 19; i++) {
              temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
              E = D;
              D = C;
              C = rotate_left(B, 30);
              B = A;
              A = temp;
          }

          for (i = 20; i <= 39; i++) {
              temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
              E = D;
              D = C;
              C = rotate_left(B, 30);
              B = A;
              A = temp;
          }

          for (i = 40; i <= 59; i++) {
              temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
              E = D;
              D = C;
              C = rotate_left(B, 30);
              B = A;
              A = temp;
          }

          for (i = 60; i <= 79; i++) {
              temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
              E = D;
              D = C;
              C = rotate_left(B, 30);
              B = A;
              A = temp;
          }

          H0 = (H0 + A) & 0x0ffffffff;
          H1 = (H1 + B) & 0x0ffffffff;
          H2 = (H2 + C) & 0x0ffffffff;
          H3 = (H3 + D) & 0x0ffffffff;
          H4 = (H4 + E) & 0x0ffffffff;
      }

      temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
      return temp.toLowerCase();
  };

  /* from http://phpjs.org/functions/urldecode:572 */
  PHP.urldecode = function(str) {
      // Decodes URL-encoded string  
      // 
      // version: 1103.1210
      // discuss at: http://phpjs.org/functions/urldecode
      // +   original by: Philip Peterson
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +      input by: AJ
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: Brett Zamir (http://brett-zamir.me)
      // +      input by: travc
      // +      input by: Brett Zamir (http://brett-zamir.me)
      // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: Lars Fischer
      // +      input by: Ratheous
      // +   improved by: Orlando
      // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
      // +      bugfixed by: Rob
      // +      input by: e-mike
      // +   improved by: Brett Zamir (http://brett-zamir.me)
      // %        note 1: info on what encoding functions to use from: http://xkr.us/articles/javascript/encode-compare/
      // %        note 2: Please be aware that this function expects to decode from UTF-8 encoded strings, as found on
      // %        note 2: pages served as UTF-8
      // *     example 1: urldecode('Kevin+van+Zonneveld%21');
      // *     returns 1: 'Kevin van Zonneveld!'
      // *     example 2: urldecode('http%3A%2F%2Fkevin.vanzonneveld.net%2F');
      // *     returns 2: 'http://kevin.vanzonneveld.net/'
      // *     example 3: urldecode('http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a');
      // *     returns 3: 'http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a'
      return decodeURIComponent(String(str).replace(/\+/g, '%20'));
  };

  /* http://phpjs.org/functions/parse_url:485 version 1009.2513 */
  // note: Does not replace invalid characters with '_' as in PHP, nor does it return false for bad URLs
  PHP.parse_url = function(str, component) {
    var o = {
      strictMode: false,
      key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
      q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
      },
      parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ 
          // Added one optional slash to post-protocol to catch file:/// (should restrict this)
      }
    },
    m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
    uri = {},
    i = 14,
    retArr;
    while (i--) { uri[o.key[i]] = m[i] || ""; }
    switch (component) {
      case 'PHP_URL_SCHEME':
        return uri.protocol;
      case 'PHP_URL_HOST':
        return uri.host;
      case 'PHP_URL_PORT':
        return uri.port;
      case 'PHP_URL_USER':
        return uri.user;
      case 'PHP_URL_PASS':
        return uri.password;
      case 'PHP_URL_PATH':
        return uri.path;
      case 'PHP_URL_QUERY':
        return uri.query;
      case 'PHP_URL_FRAGMENT':
        return uri.anchor;
      default:
        retArr = {};
        if (uri.protocol !== '') {retArr.scheme=uri.protocol;}
        if (uri.host !== '') {retArr.host=uri.host;}
        if (uri.port !== '') {retArr.port=uri.port;}
        if (uri.user !== '') {retArr.user=uri.user;}
        if (uri.password !== '') {retArr.pass=uri.password;}
        if (uri.path !== '') {retArr.path=uri.path;}
        if (uri.query !== '') {retArr.query=uri.query;}
        if (uri.anchor !== '') {retArr.fragment=uri.anchor;}
        return retArr;
    }
  };

  /* from http://phpjs.org/functions/parse_str:484 */
  PHP.parse_str = function(str, array) {
      // http://kevin.vanzonneveld.net
      // +   original by: Cagri Ekin
      // +   improved by: Michael White (http://getsprink.com)
      // +    tweaked by: Jack
      // +   bugfixed by: Onno Marsman
      // +   reimplemented by: stag019
      // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
      // +   bugfixed by: stag019
      // -    depends on: urldecode
      // +   input by: Dreamer
      // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
      // %        note 1: When no argument is specified, will put variables in global scope.
      // *     example 1: var arr = {};
      // *     example 1: parse_str('first=foo&second=bar', arr);
      // *     results 1: arr == { first: 'foo', second: 'bar' }
      // *     example 2: var arr = {};
      // *     example 2: parse_str('str_a=Jack+and+Jill+didn%27t+see+the+well.', arr);
      // *     results 2: arr == { str_a: "Jack and Jill didn't see the well." }
      var glue1 = '=',
          glue2 = '&',
          array2 = String(str).replace(/^&?([\s\S]*?)&?$/, '$1').split(glue2),
          i, j, chr, tmp, key, value, bracket, keys, evalStr, that = this,
          fixStr = function (str) {
              return that.urldecode(str).replace(/([\\"'])/g, '\\$1').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
          };

      if (!array) {
          array = window;
      }

      for (i = 0; i < array2.length; i++) {
          tmp = array2[i].split(glue1);
          if (tmp.length < 2) {
              tmp = [tmp, ''];
          }
          key = fixStr(tmp[0]);
          value = fixStr(tmp[1]);
          while (key.charAt(0) === ' ') {
              key = key.substr(1);
          }
          if (key.indexOf('\u0000') !== -1) {
              key = key.substr(0, key.indexOf('\u0000'));
          }
          if (key && key.charAt(0) !== '[') {
              keys = [];
              bracket = 0;
              for (j = 0; j < key.length; j++) {
                  if (key.charAt(j) === '[' && !bracket) {
                      bracket = j + 1;
                  } else if (key.charAt(j) === ']') {
                      if (bracket) {
                          if (!keys.length) {
                              keys.push(key.substr(0, bracket - 1));
                          }
                          keys.push(key.substr(bracket, j - bracket));
                          bracket = 0;
                          if (key.charAt(j + 1) !== '[') {
                              break;
                          }
                      }
                  }
              }
              if (!keys.length) {
                  keys = [key];
              }
              for (j = 0; j < keys[0].length; j++) {
                  chr = keys[0].charAt(j);
                  if (chr === ' ' || chr === '.' || chr === '[') {
                      keys[0] = keys[0].substr(0, j) + '_' + keys[0].substr(j + 1);
                  }
                  if (chr === '[') {
                      break;
                  }
              }
              /*jslint evil:true*/
              evalStr = 'array';
              for (j = 0; j < keys.length; j++) {
                  key = keys[j];
                  if ((key !== '' && key !== ' ') || j === 0) {
                      key = "'" + key + "'";
                  } else {
                      key = eval(evalStr + '.push([]);') - 1;
                  }
                  evalStr += '[' + key + ']';
                  if (j !== keys.length - 1 && eval('typeof ' + evalStr) === 'undefined') {
                      eval(evalStr + ' = [];');
                  }
              }
              evalStr += " = '" + value + "';\n";
              eval(evalStr);
              /*jslint evil:false*/
          }
      }
  };

  PHP.htmlspecialchars = function(string, quote_style, charset, double_encode) {
      // http://kevin.vanzonneveld.net
      // +   original by: Mirek Slugen
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   bugfixed by: Nathan
      // +   bugfixed by: Arno
      // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
      // +      input by: Ratheous
      // +      input by: Mailfaker (http://www.weedem.fr/)
      // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
      // +      input by: felix
      // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
      // %        note 1: charset argument not supported
      // *     example 1: htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES');
      // *     returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
      // *     example 2: htmlspecialchars("ab\"c'd", ['ENT_NOQUOTES', 'ENT_QUOTES']);
      // *     returns 2: 'ab"c&#039;d'
      // *     example 3: htmlspecialchars("my "&entity;" is still here", null, null, false);
      // *     returns 3: 'my &quot;&entity;&quot; is still here'
      var optTemp = 0,
      i = 0,
      noquotes = false,
      OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
      };
      /* END: var */
      if (typeof quote_style === 'undefined' || quote_style === null) {
          quote_style = 2;
      }
      string = string.toString();
      if (double_encode !== false) { // Put this first to avoid double-encoding
          string = string.replace(/&/g, '&amp;');
      }
      string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      if (quote_style === 0) {
          noquotes = true;
      }
      if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
          quote_style = [].concat(quote_style);
          for (i = 0; i < quote_style.length; i++) {
              // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
              if (OPTS[quote_style[i]] === 0) {
                  noquotes = true;
              }
              else if (OPTS[quote_style[i]]) {
                  optTemp = optTemp | OPTS[quote_style[i]];
              }
          }
          quote_style = optTemp;
      }
      if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
          string = string.replace(/'/g, '&#039;');
      }
      if (!noquotes) {
          string = string.replace(/"/g, '&quot;');
      }

      return string;
  };

  PHP.htmlspecialchars_decode = function(string, quote_style) {
      // http://kevin.vanzonneveld.net
      // +   original by: Mirek Slugen
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   bugfixed by: Mateusz "loonquawl" Zalega
      // +      input by: ReverseSyntax
      // +      input by: Slawomir Kaniecki
      // +      input by: Scott Cariss
      // +      input by: Francois
      // +   bugfixed by: Onno Marsman
      // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
      // +      input by: Ratheous
      // +      input by: Mailfaker (http://www.weedem.fr/)
      // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
      // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
      // *     example 1: htmlspecialchars_decode("<p>this -&gt; &quot;</p>", 'ENT_NOQUOTES');
      // *     returns 1: '<p>this -> &quot;</p>'
      // *     example 2: htmlspecialchars_decode("&amp;quot;");
      // *     returns 2: '&quot;'
      var optTemp = 0,
      i = 0,
      noquotes = false,
      OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
      };
      if (typeof quote_style === 'undefined') {
          quote_style = 2;
      }
      string = string.toString().replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      if (quote_style === 0) {
          noquotes = true;
      }
      if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
          quote_style = [].concat(quote_style);
          for (i = 0; i < quote_style.length; i++) {
              // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
              if (OPTS[quote_style[i]] === 0) {
                  noquotes = true;
              } else if (OPTS[quote_style[i]]) {
                  optTemp = optTemp | OPTS[quote_style[i]];
              }
          }
          quote_style = optTemp;
      }
      if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
          string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
          // string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
      }
      if (!noquotes) {
          string = string.replace(/&quot;/g, '"');
      }
      // Put this in last place to avoid escape being double-decoded
      string = string.replace(/&amp;/g, '&');

      return string;
  };

  PHP.getenv = function(varname) {
      // Get the value of an environment variable  
      // 
      // version: 1109.2015
      // discuss at: http://phpjs.org/functions/getenv
      // +   original by: Brett Zamir (http://brett-zamir.me)
      // %        note 1: We are not using $_ENV as in PHP, you could define
      // %        note 1: "$_ENV = this.php_js.ENV;" and get/set accordingly
      // %        note 2: Returns e.g. 'en-US' when set global this.php_js.ENV is set
      // %        note 3: Uses global: php_js to store environment info
      // *     example 1: getenv('LC_ALL');
      // *     returns 1: false
      if (!PHP.php_js || !PHP.php_js.ENV || !PHP.php_js.ENV[varname]) {
          return false;
      }

      return PHP.php_js.ENV[varname];
  };

  /*jslint nomen:true*/
  PHP.setlocale = function(category, locale) {
    // Set locale information  
    // 
    // version: 1107.2516
    // discuss at: http://phpjs.org/functions/setlocale
    // +   original by: Brett Zamir (http://brett-zamir.me)
    // +   derived from: Blues at http://hacks.bluesmoon.info/strftime/strftime.js
    // +   derived from: YUI Library: http://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html
    // -    depends on: getenv
    // %          note 1: Is extensible, but currently only implements locales en,
    // %          note 1: en_US, en_GB, en_AU, fr, and fr_CA for LC_TIME only; C for LC_CTYPE;
    // %          note 1: C and en for LC_MONETARY/LC_NUMERIC; en for LC_COLLATE
    // %          note 2: Uses global: php_js to store locale info
    // %          note 3: Consider using http://demo.icu-project.org/icu-bin/locexp as basis for localization (as in i18n_loc_set_default())
    // *     example 1: setlocale('LC_ALL', 'en_US');
    // *     returns 1: 'en_US'
    var categ = '',
    cats = [],
    i = 0,
    d = window.document,
    /** BEGIN STATIC
     * @inner
     */
    _copy = function _copy(orig) {
      var i, newObj;
      if (orig instanceof RegExp) {
        return new RegExp(orig);
      } else if (orig instanceof Date) {
        return new Date(orig);
      }
      newObj = {};
      for (i in orig) {
        if (typeof orig[i] === 'object') {
          newObj[i] = _copy(orig[i]);
        } else {
          newObj[i] = orig[i];
        }
      }
      return newObj;
    },

    // Function usable by a ngettext implementation (apparently not an accessible part of setlocale(), but locale-specific)
    // See http://www.gnu.org/software/gettext/manual/gettext.html#Plural-forms though amended with others from
    // https://developer.mozilla.org/En/Localization_and_Plurals (new categories noted with "MDC" below, though
    // not sure of whether there is a convention for the relative order of these newer groups as far as ngettext)
    // The function name indicates the number of plural forms (nplural)
    // Need to look into http://cldr.unicode.org/ (maybe future JavaScript); Dojo has some functions (under new BSD),
    // including JSON conversions of LDML XML from CLDR: http://bugs.dojotoolkit.org/browser/dojo/trunk/cldr
    // and docs at http://api.dojotoolkit.org/jsdoc/HEAD/dojo.cldr
    _nplurals1 = function (n) { // e.g., Japanese
      return 0;
    },
    _nplurals2a = function (n) { // e.g., English
      return n !== 1 ? 1 : 0;
    },
    _nplurals2b = function (n) { // e.g., French
      return n > 1 ? 1 : 0;
    },
    _nplurals2c = function (n) { // e.g., Icelandic (MDC)
      return n % 10 === 1 && n % 100 !== 11 ? 0 : 1;
    },
    _nplurals3a = function (n) { // e.g., Latvian (MDC has a different order from gettext)
      return n % 10 === 1 && n % 100 !== 11 ? 0 : n !== 0 ? 1 : 2;
    },
    _nplurals3b = function (n) { // e.g., Scottish Gaelic
      return n === 1 ? 0 : n === 2 ? 1 : 2;
    },
    _nplurals3c = function (n) { // e.g., Romanian
      return n === 1 ? 0 : (n === 0 || (n % 100 > 0 && n % 100 < 20)) ? 1 : 2;
    },
    _nplurals3d = function (n) { // e.g., Lithuanian (MDC has a different order from gettext)
      return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
    },
    _nplurals3e = function (n) { // e.g., Croatian
      return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
    },
    _nplurals3f = function (n) { // e.g., Slovak
      return n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2;
    },
    _nplurals3g = function (n) { // e.g., Polish
      return n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
    },
    _nplurals3h = function (n) { // e.g., Macedonian (MDC)
      return n % 10 === 1 ? 0 : n % 10 === 2 ? 1 : 2;
    },
    _nplurals4a = function (n) { // e.g., Slovenian
      return n % 100 === 1 ? 0 : n % 100 === 2 ? 1 : n % 100 === 3 || n % 100 === 4 ? 2 : 3;
    },
    _nplurals4b = function (n) { // e.g., Maltese (MDC)
      return n === 1 ? 0 : n === 0 || (n % 100 && n % 100 <= 10) ? 1 : n % 100 >= 11 && n % 100 <= 19 ? 2 : 3;
    },
    _nplurals5 = function (n) { // e.g., Irish Gaeilge (MDC)
      return n === 1 ? 0 : n === 2 ? 1 : n >= 3 && n <= 6 ? 2 : n >= 7 && n <= 10 ? 3 : 4;
    },
    _nplurals6 = function (n) { // e.g., Arabic (MDC) - Per MDC puts 0 as last group
      return n === 0 ? 5 : n === 1 ? 0 : n === 2 ? 1 : n % 100 >= 3 && n % 100 <= 10 ? 2 : n % 100 >= 11 && n % 100 <= 99 ? 3 : 4;
    },
    // END STATIC
    // BEGIN REDUNDANT
    phpjs = PHP.php_js || {},
    NS_XHTML,
    NS_XML;
    /* END: var */
    
    phpjs = PHP.php_js;


    // Reconcile Windows vs. *nix locale names?
    // Allow different priority orders of languages, esp. if implement gettext as in
    //     LANGUAGE env. var.? (e.g., show German if French is not available)
    if (!phpjs.locales) {
      // Can add to the locales
      phpjs.locales = {};

      phpjs.locales.en = {
        'LC_COLLATE': // For strcoll


        function (str1, str2) { // Fix: This one taken from strcmp, but need for other locales; we don't use localeCompare since its locale is not settable
          return (String(str1) === String(str2)) ? 0 : ((str1 > str2) ? 1 : -1);
        },
        'LC_CTYPE': { // Need to change any of these for English as opposed to C?
          an: /^[A-Za-z\d]+$/g,
          al: /^[A-Za-z]+$/g,
          ct: /^[\u0000-\u001F\u007F]+$/g,
          dg: /^[\d]+$/g,
          gr: /^[\u0021-\u007E]+$/g,
          lw: /^[a-z]+$/g,
          pr: /^[\u0020-\u007E]+$/g,
          pu: /^[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/g,
          sp: /^[\f\n\r\t\v ]+$/g,
          up: /^[A-Z]+$/g,
          xd: /^[A-Fa-f\d]+$/g,
          CODESET: 'UTF-8',
          // Used by sql_regcase
          lower: 'abcdefghijklmnopqrstuvwxyz',
          upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        },
        'LC_TIME': { // Comments include nl_langinfo() constant equivalents and any changes from Blues' implementation
          a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          // ABDAY_
          A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          // DAY_
          b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          // ABMON_
          B: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          // MON_
          c: '%a %d %b %Y %r %Z',
          // D_T_FMT // changed %T to %r per results
          p: ['AM', 'PM'],
          // AM_STR/PM_STR
          P: ['am', 'pm'],
          // Not available in nl_langinfo()
          r: '%I:%M:%S %p',
          // T_FMT_AMPM (Fixed for all locales)
          x: '%m/%d/%Y',
          // D_FMT // switched order of %m and %d; changed %y to %Y (C uses %y)
          X: '%r',
          // T_FMT // changed from %T to %r  (%T is default for C, not English US)
          // Following are from nl_langinfo() or http://www.cptec.inpe.br/sx4/sx4man2/g1ab02e/strftime.4.html
          alt_digits: '',
          // e.g., ordinal
          ERA: '',
          ERA_YEAR: '',
          ERA_D_T_FMT: '',
          ERA_D_FMT: '',
          ERA_T_FMT: ''
        },
        // Assuming distinction between numeric and monetary is thus:
        // See below for C locale
        'LC_MONETARY': { // Based on Windows "english" (English_United States.1252) locale
          int_curr_symbol: 'USD',
          currency_symbol: '$',
          mon_decimal_point: '.',
          mon_thousands_sep: ',',
          mon_grouping: [3],
          // use mon_thousands_sep; "" for no grouping; additional array members indicate successive group lengths after first group (e.g., if to be 1,23,456, could be [3, 2])
          positive_sign: '',
          negative_sign: '-',
          int_frac_digits: 2,
          // Fractional digits only for money defaults?
          frac_digits: 2,
          p_cs_precedes: 1,
          // positive currency symbol follows value = 0; precedes value = 1
          p_sep_by_space: 0,
          // 0: no space between curr. symbol and value; 1: space sep. them unless symb. and sign are adjacent then space sep. them from value; 2: space sep. sign and value unless symb. and sign are adjacent then space separates
          n_cs_precedes: 1,
          // see p_cs_precedes
          n_sep_by_space: 0,
          // see p_sep_by_space
          p_sign_posn: 3,
          // 0: parentheses surround quantity and curr. symbol; 1: sign precedes them; 2: sign follows them; 3: sign immed. precedes curr. symbol; 4: sign immed. succeeds curr. symbol
          n_sign_posn: 0 // see p_sign_posn
        },
        'LC_NUMERIC': { // Based on Windows "english" (English_United States.1252) locale
          decimal_point: '.',
          thousands_sep: ',',
          grouping: [3] // see mon_grouping, but for non-monetary values (use thousands_sep)
        },
        'LC_MESSAGES': {
          YESEXPR: '^[yY].*',
          NOEXPR: '^[nN].*',
          YESSTR: '',
          NOSTR: ''
        },
        nplurals: _nplurals2a
      };
      phpjs.locales.en_US = _copy(phpjs.locales.en);
      phpjs.locales.en_US.LC_TIME.c = '%a %d %b %Y %r %Z';
      phpjs.locales.en_US.LC_TIME.x = '%D';
      phpjs.locales.en_US.LC_TIME.X = '%r';
      // The following are based on *nix settings
      phpjs.locales.en_US.LC_MONETARY.int_curr_symbol = 'USD ';
      phpjs.locales.en_US.LC_MONETARY.p_sign_posn = 1;
      phpjs.locales.en_US.LC_MONETARY.n_sign_posn = 1;
      phpjs.locales.en_US.LC_MONETARY.mon_grouping = [3, 3];
      phpjs.locales.en_US.LC_NUMERIC.thousands_sep = '';
      phpjs.locales.en_US.LC_NUMERIC.grouping = [];

      phpjs.locales.en_GB = _copy(phpjs.locales.en);
      phpjs.locales.en_GB.LC_TIME.r = '%l:%M:%S %P %Z';

      phpjs.locales.en_AU = _copy(phpjs.locales.en_GB);
      phpjs.locales.C = _copy(phpjs.locales.en); // Assume C locale is like English (?) (We need C locale for LC_CTYPE)
      phpjs.locales.C.LC_CTYPE.CODESET = 'ANSI_X3.4-1968';
      phpjs.locales.C.LC_MONETARY = {
        int_curr_symbol: '',
        currency_symbol: '',
        mon_decimal_point: '',
        mon_thousands_sep: '',
        mon_grouping: [],
        p_cs_precedes: 127,
        p_sep_by_space: 127,
        n_cs_precedes: 127,
        n_sep_by_space: 127,
        p_sign_posn: 127,
        n_sign_posn: 127,
        positive_sign: '',
        negative_sign: '',
        int_frac_digits: 127,
        frac_digits: 127
      };
      phpjs.locales.C.LC_NUMERIC = {
        decimal_point: '.',
        thousands_sep: '',
        grouping: []
      };
      phpjs.locales.C.LC_TIME.c = '%a %b %e %H:%M:%S %Y'; // D_T_FMT
      phpjs.locales.C.LC_TIME.x = '%m/%d/%y'; // D_FMT
      phpjs.locales.C.LC_TIME.X = '%H:%M:%S'; // T_FMT
      phpjs.locales.C.LC_MESSAGES.YESEXPR = '^[yY]';
      phpjs.locales.C.LC_MESSAGES.NOEXPR = '^[nN]';

      phpjs.locales.fr = _copy(phpjs.locales.en);
      phpjs.locales.fr.nplurals = _nplurals2b;
      phpjs.locales.fr.LC_TIME.a = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
      phpjs.locales.fr.LC_TIME.A = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      phpjs.locales.fr.LC_TIME.b = ['jan', 'f\u00E9v', 'mar', 'avr', 'mai', 'jun', 'jui', 'ao\u00FB', 'sep', 'oct', 'nov', 'd\u00E9c'];
      phpjs.locales.fr.LC_TIME.B = ['janvier', 'f\u00E9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\u00FBt', 'septembre', 'octobre', 'novembre', 'd\u00E9cembre'];
      phpjs.locales.fr.LC_TIME.c = '%a %d %b %Y %T %Z';
      phpjs.locales.fr.LC_TIME.p = ['', ''];
      phpjs.locales.fr.LC_TIME.P = ['', ''];
      phpjs.locales.fr.LC_TIME.x = '%d.%m.%Y';
      phpjs.locales.fr.LC_TIME.X = '%T';

      phpjs.locales.fr_CA = _copy(phpjs.locales.fr);
      phpjs.locales.fr_CA.LC_TIME.x = '%Y-%m-%d';
    }
    if (!phpjs.locale) {
      phpjs.locale = 'en_US';
      NS_XHTML = 'http://www.w3.org/1999/xhtml';
      NS_XML = 'http://www.w3.org/XML/1998/namespace';
      if (d.getElementsByTagNameNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0]) {
        if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang')) {
          phpjs.locale = d.getElementsByTagName(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang');
        } else if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang) { // XHTML 1.0 only
          phpjs.locale = d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang;
        }
      } else if (d.getElementsByTagName('html')[0] && d.getElementsByTagName('html')[0].lang) {
        phpjs.locale = d.getElementsByTagName('html')[0].lang;
      }
    }
    phpjs.locale = phpjs.locale.replace('-', '_'); // PHP-style
    // Fix locale if declared locale hasn't been defined
    if (!(phpjs.locales[phpjs.locale])) {
      if (phpjs.locale.replace(/_[a-zA-Z]+$/, '') in phpjs.locales) {
        phpjs.locale = phpjs.locale.replace(/_[a-zA-Z]+$/, '');
      }
    }

    if (!phpjs.localeCategories) {
      phpjs.localeCategories = {
        'LC_COLLATE': phpjs.locale,
        // for string comparison, see strcoll()
        'LC_CTYPE': phpjs.locale,
        // for character classification and conversion, for example strtoupper()
        'LC_MONETARY': phpjs.locale,
        // for localeconv()
        'LC_NUMERIC': phpjs.locale,
        // for decimal separator (See also localeconv())
        'LC_TIME': phpjs.locale,
        // for date and time formatting with strftime()
        'LC_MESSAGES': phpjs.locale // for system responses (available if PHP was compiled with libintl)
      };
    }
    // END REDUNDANT
    if (locale === null || locale === '') {
      locale = PHP.getenv(category) || PHP.getenv('LANG');
    } else if (Object.prototype.toString.call(locale) === '[object Array]') {
      for (i = 0; i < locale.length; i++) {
        if (!(PHP.php_js.locales[locale[i]])) {
          if (i === locale.length - 1) {
            return false; // none found
          }
          continue;
        }
        locale = locale[i];
        break;
      }
    }

    // Just get the locale
    if (locale === '0' || locale === 0) {
      if (category === 'LC_ALL') {
        for (categ in PHP.php_js.localeCategories) {
          cats.push(categ + '=' + PHP.php_js.localeCategories[categ]); // Add ".UTF-8" or allow ".@latint", etc. to the end?
        }
        return cats.join(';');
      }
      return PHP.php_js.localeCategories[category];
    }

    if (!(locale in PHP.php_js.locales)) {
      return false; // Locale not found
    }

    // Set and get locale
    if (category === 'LC_ALL') {
      for (categ in PHP.php_js.localeCategories) {
        PHP.php_js.localeCategories[categ] = locale;
      }
    } else {
      PHP.php_js.localeCategories[category] = locale;
    }
    return locale;
  };
  /*jslint nomen:false*/

  /**
  * @param {String} fmt format string (C library strftime-style)
  * @param {String} timestamp ISO 8601 formatted time string
  * @returns {String}
  */
  PHP.strftime = function(fmt, timestamp) {
    // Format a local time/date according to locale settings  
    // 
    // version: 1107.2516
    // discuss at: http://phpjs.org/functions/strftime
    // +      original by: Blues (http://tech.bluesmoon.info/)
    // + reimplemented by: Brett Zamir (http://brett-zamir.me)
    // +   input by: Alex
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // -       depends on: setlocale
    // %        note 1: Uses global: php_js to store locale info
    // *        example 1: strftime("%A", 1062462400); // Return value will depend on date and locale
    // *        returns 1: 'Tuesday'
    // BEGIN REDUNDANT
    var phpjs = PHP.php_js || {};
    PHP.php_js = phpjs;
    PHP.setlocale('LC_ALL', 0); // ensure setup of localization variables takes place
    // END REDUNDANT

    // BEGIN STATIC
    var _xPad = function (x, pad, r) {
      if (typeof r === 'undefined') {
        r = 10;
      }
      for (; parseInt(x, 10) < r && r > 1; r /= 10) {
        x = pad.toString() + x;
      }
      return x.toString();
    };

    var locale = phpjs.localeCategories.LC_TIME;
    var locales = phpjs.locales;
    var lc_time = locales[locale].LC_TIME;

    var _formats = {
      a: function (d) {
        return lc_time.a[d.getDay()];
      },
      A: function (d) {
        return lc_time.A[d.getDay()];
      },
      b: function (d) {
        return lc_time.b[d.getMonth()];
      },
      B: function (d) {
        return lc_time.B[d.getMonth()];
      },
      C: function (d) {
        return _xPad(parseInt(d.getFullYear() / 100, 10), 0);
      },
      d: ['getDate', '0'],
      e: ['getDate', ' '],
      g: function (d) {
        return _xPad(parseInt(this.G(d) / 100, 10), 0);
      },
      G: function (d) {
        var y = d.getFullYear();
        var V = parseInt(_formats.V(d), 10);
        var W = parseInt(_formats.W(d), 10);

        if (W > V) {
          y++;
        } else if (W === 0 && V >= 52) {
          y--;
        }

        return y;
      },
      H: ['getHours', '0'],
      I: function (d) {
        var I = d.getHours() % 12;
        return _xPad(I === 0 ? 12 : I, 0);
      },
      j: function (d) {
        var ms = d - new Date('' + d.getFullYear() + '/1/1 GMT');
        ms += d.getTimezoneOffset() * 60000; // Line differs from Yahoo implementation which would be equivalent to replacing it here with:
        // ms = new Date('' + d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' GMT') - ms;
        var doy = parseInt(ms / 60000 / 60 / 24, 10) + 1;
        return _xPad(doy, 0, 100);
      },
      k: ['getHours', '0'],
      // not in PHP, but implemented here (as in Yahoo)
      l: function (d) {
        var l = d.getHours() % 12;
        return _xPad(l === 0 ? 12 : l, ' ');
      },
      m: function (d) {
        return _xPad(d.getMonth() + 1, 0);
      },
      M: ['getMinutes', '0'],
      p: function (d) {
        return lc_time.p[d.getHours() >= 12 ? 1 : 0];
      },
      P: function (d) {
        return lc_time.P[d.getHours() >= 12 ? 1 : 0];
      },
      s: function (d) { // Yahoo uses return parseInt(d.getTime()/1000, 10);
        return Date.parse(d) / 1000;
      },
      S: ['getSeconds', '0'],
      u: function (d) {
        var dow = d.getDay();
        return ((dow === 0) ? 7 : dow);
      },
      U: function (d) {
        var doy = parseInt(_formats.j(d), 10);
        var rdow = 6 - d.getDay();
        var woy = parseInt((doy + rdow) / 7, 10);
        return _xPad(woy, 0);
      },
      V: function (d) {
        var woy = parseInt(_formats.W(d), 10);
        var dow1_1 = (new Date('' + d.getFullYear() + '/1/1')).getDay();
        // First week is 01 and not 00 as in the case of %U and %W,
        // so we add 1 to the final result except if day 1 of the year
        // is a Monday (then %W returns 01).
        // We also need to subtract 1 if the day 1 of the year is
        // Friday-Sunday, so the resulting equation becomes:
        var idow = woy + (dow1_1 > 4 || dow1_1 <= 1 ? 0 : 1);
        if (idow === 53 && (new Date('' + d.getFullYear() + '/12/31')).getDay() < 4) {
          idow = 1;
        } else if (idow === 0) {
          idow = _formats.V(new Date('' + (d.getFullYear() - 1) + '/12/31'));
        }
        return _xPad(idow, 0);
      },
      w: 'getDay',
      W: function (d) {
        var doy = parseInt(_formats.j(d), 10);
        var rdow = 7 - _formats.u(d);
        var woy = parseInt((doy + rdow) / 7, 10);
        return _xPad(woy, 0, 10);
      },
      y: function (d) {
        return _xPad(d.getFullYear() % 100, 0);
      },
      Y: 'getFullYear',
      z: function (d) {
        var o = d.getTimezoneOffset();
        var H = _xPad(parseInt(Math.abs(o / 60), 10), 0);
        var M = _xPad(o % 60, 0);
        return (o > 0 ? '-' : '+') + H + M;
      },
      Z: function (d) {
        return d.toString().replace(/^.*\(([^)]+)\)$/, '$1');
      /*
              // Yahoo's: Better?
              var tz = d.toString().replace(/^.*:\d\d( GMT[+-]\d+)? \(?([A-Za-z ]+)\)?\d*$/, '$2').replace(/[a-z ]/g, '');
              if(tz.length > 4) {
                  tz = Dt.formats.z(d);
              }
              return tz;
              */
      },
      '%': function (d) {
        return '%';
      }
    };
    // END STATIC
    /* Fix: Locale alternatives are supported though not documented in PHP; see http://linux.die.net/man/3/strptime */

    var _date = ((typeof(timestamp) == 'undefined') ? new Date() : // Not provided
      (typeof(timestamp) == 'object') ? new Date(timestamp) : // Javascript Date()
      new Date(timestamp * 1000) // PHP API expects UNIX timestamp (auto-convert to int)
      );
    var _aggregates = {
      c: 'locale',
      D: '%m/%d/%y',
      F: '%y-%m-%d',
      h: '%b',
      n: '\n',
      r: 'locale',
      R: '%H:%M',
      t: '\t',
      T: '%H:%M:%S',
      x: 'locale',
      X: 'locale'
    };


    // First replace aggregates (run in a loop because an agg may be made up of other aggs)
    while (fmt.match(/%[cDFhnrRtTxX]/)) {
      fmt = fmt.replace(/%([cDFhnrRtTxX])/g, function (m0, m1) {
        var f = _aggregates[m1];
        return (f === 'locale' ? lc_time[m1] : f);
      });
    }

    // Now replace formats - we need a closure so that the date object gets passed through
    var str = fmt.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, function (m0, m1) {
      var f = _formats[m1];
      if (typeof f === 'string') {
        return _date[f]();
      } else if (typeof f === 'function') {
        return f(_date);
      } else if (typeof f === 'object' && typeof(f[0]) === 'string') {
        return _xPad(_date[f[0]](), f[1]);
      } else { // Shouldn't reach here
        return m1;
      }
    });
    return str;
  };
  
  return PHP;

});
