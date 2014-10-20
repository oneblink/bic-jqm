# BIC-jQM: publicly-accessible values

Note: this document assumes you are familiar with [JSDoc 3 namepaths](https://github.com/blinkmobile/docs/wiki/Code-Style:-JSDoc-3).

BIC-jQM creates and maintains state across JavaScript objects and values. If you
know where to look, you may access this state from your own custom JavaScript.

We use [Backbone.JS](http://backbonejs.org/) to manage state with conventional
Object-Oriented patterns. Thus, you may interrogate and manipulate the BIC-jQM
state by using the Backbone APIs.

## Backbone.Model

You may use the [`Backbone.Model`](http://backbonejs.org/#Model) and the
[`Backbone.Events`](http://backbonejs.org/#Events) APIs on the objects listed in
this section.

### BMP.BIC3

The primary access point for much of the BIC-jQM state

```javascript
require(['bic'], function (bic) {
  bic === window.BMP.BIC3; // true;
});
```

#### .version

- @type {String}

A handy reference to the current version of BIC-jQM

```javascript
require(['bic'], function (bic) {
  bic.version; // "x.y.z"
});
```

#### .id

- @type {String}

A handy reference to the name of the answerSpace

```javascript
require(['bic'], function (bic) {
  bic.id; // "name"
});
```

#### (attribute) loginStatus

- either a {Boolean} `false`, or an {Object} containing current user
  authentication information

```javascript
require(['bic'], function (bic) {
  bic.get('loginStatus'); // false or { ...}
});
```

#### .populate()

- @returns {Promise}

The boot sequence automatically calls `BMP.BIC3.populate()` once, causing BMP-jQM
to retrieve configuration information from the server.

We call this again if the end-user's login status changes, as the per-user
configuration may be different from the anonymous configuration (e.g.
Interactions that require users to login).
