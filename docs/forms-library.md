# BIC-jQM: Forms integration


## Accessing Forms APIs

It may often be necessary to make direct calls to the Forms API.


### BIC-jQM v4.x.y and newer

The BIC starts downloading the [Forms](https://github.com/blinkmobile/forms) library after the BIC itself has booted.
BIC functionality that depends on Forms will wait until this is complete.
Users will see and be able to use non-Forms features sooner than before.

```js
// unsafe to access `window.BMP.Forms` here

require(['bic', 'bic/promise-forms'], function (BIC, loadForms) {
  'use strict';

  // unsafe to access `window.BMP.Forms` here

	loadForms()
  // begin downloading the Forms library, if it hasn't yet started
  // @returns {Promise}
	.then(function (Forms) {

    // `Forms` is ready for use, and is a reference to `window.BMP.Forms`
    console.assert(Forms === window.BMP.Forms);

  });

});
```


### BIC-jQM v3.x.y and older

Require.js downloads the [Forms](https://github.com/blinkmobile/forms) library,
and does not even start booting the BIC until this is complete.
This makes the BIC boot sequence unnecessarily brittle,
and increases the time elapsed before users see something useful.

```js
// unsafe to access `window.BMP.Forms` here

require(['bic'], function () {
  'use strict';

  console.assert(window.BMP.Forms);

});
```
