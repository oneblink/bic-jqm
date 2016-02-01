# Router Middleware

- available in BIC v4.2.1 and newer

- inspired by http://expressjs.com/guide/using-middleware.html


## API


### BMP.BIC.Router.Middleware

- constructor

- extends https://github.com/alessioalex/generic-middleware

- primary instance available at `window.BMP.BIC.router.middleware`


#### middleware (jqmData: Object, bicData: Object, next: Function)

- the next middleware in the sequence receives the `jqmData` and `bicData` explicitly provided by the preceding middleware

e.g.

```js
function myMiddleware (jqmData, bicData, next) {
  // TODO: something
  next(null, jqmData, bicData);

  // or signal that something went wrong?
  next(new Error('something bad'), jqmData, bicData);
}
```

##### middleware next (error: Error, jqmData: Object?, bicData: Object?)

- each middleware function must call `next()` when done

    - otherwise navigation will stall



#### built-in middleware

- defined here: [../src/bic/router/middleware/](../src/bic/router/middleware/)

- available as properties on `window.BMP.BIC.Router.Middleware`

    - where the property name is the name of the middleware

e.g.

```js
require(['bic/router/middleware/login'], function (login) {
  console.assert(window.BMP.BIC.Router.Middleware.login === login);
});
```


#### #toJSON () => String[]

- follows conventions for `JSON.stringify()`: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior

- returns an Array of Strings

    - each string is the name of a built-in middleware

    - Array order is the sequence in which router invokes middleware

- useful for determining a desired injection point for your own middleware

e.g.

```js
window.BMP.BIC.router.middleware.toJSON();
// ["path", "app", "whenPopulated", "login", "model", "view", "viewRender", "bootStatus", "resolve"]
```


#### #useAfter (existingFn, newFn) and #useBefore (existingFn, newFn)

- inject a new / custom middleware into the stack, relative to an existing one

e.g.

```js
var login = window.BMP.BIC.Router.Middleware.login;
window.BMP.BIC.router.middleware.useAfter(login, function (jqmData, bicData, next) {
  console.log(jqmData, bicData);
  next(null, jqmData, bicData);
});
```
