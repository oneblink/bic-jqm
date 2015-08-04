# BIC: Console Logging

For convenience, we provide a central logging API that proxies calls to the
global `console` object (if available).

```js
require(['bic'], function () {
  // now the code for the BIC is ready
  // the global `BMP.console` object provides access to our logging API
  window.BMP.console.log('hello world');
});
```


## API


### `BMP.console.debug(msg)`
### `BMP.console.info(msg)`
### `BMP.console.log(msg)`
### `BMP.console.warn(msg)`
### `BMP.console.error(msg)`

These methods are proxies to the same methods on the real `console` object. It
is safe to call our methods even when the real methods are not available.


### `BMP.console.LOG_LEVELS`

- @const {`String`[]}

This is an enumeration of the names of the logging methods, ranked in order from
most noisy to most important.


### `BMP.console.logLevel`

- @type {`Number`}
- @default 2

This is the index of the least important kind of message that you'd like to
track, based on its position in the `BMP.console.LOG_LEVELS` Array. The default
is to output "log", "warn" and "error" messages, but drop "info" and "debug"
messages.


### `BMP.console.logElement`

- @type {`?HTMLUListElement`}

We expect this to either be `null` or a `<ul></ul>` DOM Element. When this is
a DOM Element, we automatically append new `<li></li>` DOM Elements for each new
message passed to our logging API.

This is primarily provided to ease debugging in environments where log output is
otherwise difficult to access.
