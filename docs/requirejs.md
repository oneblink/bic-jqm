# BIC v3 and Require.JS

This project uses [Require.JS](http://requirejs.org/) to lazy-load components as
they are needed, and to enable the development of isolated modules. As such, any
JavaScript code you add to this environment may need minor adjustments before it
will actually execute as intended.

This is different to [BIC v2](https://github.com/blinkmobile/bic-v2), where you
could rely on jQuery and jQuery UI being available to your code at any time. In
BIC v3, jQuery and [jQuery Mobile](http://jquerymobile.com/) are loaded
asynchronously and non-deterministically. Unless you use the Require.JS API, you
cannot depend on these libraries being available.

## Examples

If your code requires [jQuery](http://jquery.com/), then you should declare that
you need jQuery so that your code is executed only _after_ it is available.

```javascript
require(['jquery'], function ($) {

  /* insert your code that uses jQuery */

});
```

If your code requires access to the BIC v3 JavaScript APIs, then you need to
declare that, too.

```javascript
require(['bic'], function () {

  /* insert your code that uses BMP.BIC3 */

});
```

Rather than nest your calls to `require` for code that needs multiple libraries,
you can declare them in one step.

```javascript
require(['jquery', 'bic', 'jquerymobile'], function ($) {

  /* insert your code that uses BMP.BIC3 */
  /* insert your code that uses jQuery */

  /**
   * jQuery Mobile is accessible via $.mobile as per
   * http://api.jquerymobile.com/
   */

});
```
