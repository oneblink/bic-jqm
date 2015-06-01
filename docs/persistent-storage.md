# BIC: persistent storage

## What's out?

Our collections avoid using any of the following mechanisms by default:

- cookies: it would be weird and unsafe to store pending records there
- sessionStorage: volatile, so loses data when the app / browser terminates
- localStorage: inconsistent but frequently low storage cap
- WebSQL: poor quotas, W3C disapproves, Firefox and IE/Edge don't offer it

## What's in?

Our collections do use WebSQL if we are in our native app. Native app shells can
provide a consistent API for WebSQL, and offer access to a large amount of the
device's total storage capacity.

If we are lacking both conditions (native app _and_ WebSQL) and IndexedDB passes
[our reliability tests](https://github.com/blinkmobile/is-indexeddb-reliable),
then we opt for IndexedDB. This is the newest of the persistent storage APIs
offered by the Web Platform, and has known-good quotas.

We use [PouchDB](pouchdb.md) to manage both WebSQL and IndexedDB with a unified
API.

Note: Safari in OS X Yosemite (10.10) and in iOS 7 and 8 does offer IndexedDB,
but it doesn't pass our reliability tests so we don't touch it.

## Checklist: before you use our persistent collections

1. check to see if the BIC has loaded

2. check to see whether the collections exist

3. check to see whether we have detected reliable persistent storage (per-above)

Example:

```javascript
require(['bic'], function (bic) { // 1.
  bic.collections().then(function () { // 2.
    if (bic.hasStorage()) { // 3.
      // TODO: do something with a persistent collection
      // e.g. `bic.interactions`, `bic.pending`, etc
    }
  });
});
```

We list our persistent collections with our other
[publicly accessible values](public-values.md).

Note: the "pending" collection will not exist if persistent storage is
unavailable.

## Backbone -> PouchDB

Backbone's Collection and Model APIs are synchronous: when your statement is
complete, you can expect the state of the Collection / Model to be as expected.

PouchDB is asynchronous: your statement will complete, and PouchDB executes the
actual storage command an unknown period of time in the future. PouchDB will
call you back when this has happened (hence the term "callback").

Backbone does provide asynchronous Collection and Model APIs that we have
configured to trigger persistent storage via PouchDB:

- [`Backbone.Model#save()`](http://backbonejs.org/#Model-save)
- [`Backbone.Model#destroy()`](http://backbonejs.org/#Model-destroy)
- [`Backbone.Collection#create()`](http://backbonejs.org/#Collection-create)

If you use these, then you can be certain that PouchDB has persisted your data
to device storage. For example:

```javascript
require(['bic'], function (bic) {
  bic.collections().then(function () {
    if (bic.hasStorage()) {
      var pendingRecord = {
        type: 'Form',
        status: 'Draft',
        name: 'MyFormName',
        label: 'My Friendlier Form Name',
        action: 'add',
        answerspaceid: BMP.BIC.siteVars.answerSpaceId,
        data: {
          /* TODO: this is where the pending record data would go */
        }
      };
      var createOptions = {};
      createOptions.success = function () {
        // TODO: do something after persistence is complete
      };
      createOptions.error = function (err) {
        // TODO: do something with `err`
      }
      bic.pending.create(pendingRecord, createOptions);
    }
  });
});
```
