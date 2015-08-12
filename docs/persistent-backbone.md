# BIC: persistent Backbone Models and Collections

For more information about the underlying persistence implementation, see our
[persistent-storage.md](persistent-storage.md) document.


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
