# BIC-jQM: Pending Queue

## non-deterministic initialisation

As described [here](requirejs.md), your code cannot assume that certain
libraries or components are available or ready to use. Your code must declare
its dependencies.

Before accessing the Pending Queue via its JavaScript API, your code will need
to wait until the API is ready for use. There is an exposed [jQuery Deferred](http://api.jquery.com/jQuery.Deferred/)
Promise available, however, it is not 100% safe to access until after the
first [pagebeforeload](http://api.jquerymobile.com/1.3/pagebeforeload/) event
from jQuery Mobile.

As such, for custom JavaScript that executes during BIC initialisation, the
following somewhat-cumbersome ritual is required:

```javascript
require(['jquery', 'bic'], function ($) {
  $(document).one('pagebeforeload', function () {
    $.when(BMP.BIC.pending.initialize).then(function () {

      /* here your code can safely manipulate the pending queue */

    });
  });
});
```

Just checking the Promise should be all that is necessary for
Interaction-specific and Form Behaviour-specific code:

```javascript
$.when(BMP.BIC.pending.initialize).then(function () {

  /* here your Interaction code can safely manipulate the pending queue */

});
```

## Data Model

Whilst the APIs may be used to persist other types of structured data, the only
supported data of interest here are records used with our Forms libraries and
services.

### Form Records

```json
{
  "id": "UUID",
  "type": "Form",
  "status": "STATUS",
  "name": "NAME",
  "action": "ACTION",
  "data": {
    "_action": "ACTION"
  }
}
```

- **UUID**: this is unique to each record in the pending queue

- **STATUS** === `Pending`: indicates a record that is ready to be submitted
- **STATUS** === `Draft`: indicates a record that is not complete

- **NAME**: this should match the identifier of the Form (i.e. in the Builder)
- **ACTION**: `add` | `edit` | `delete`

The `data` property is a mapping of Form Element names (i.e. field names) and
their values. It is required that `data._action` match the same value as
`action`.

The `status` property has special meaning. See the `processQueue` method below.

## API

As you may have guessed from the above, the pending queue object is globally
exposed as `BMP.BIC.pending`. The functionality exposed here is similar to [ORM](http://en.wikipedia.org/wiki/Object-relational_mapping)
systems that you may have encountered in other environments.

### PendingItem

This is a JavaScript constructor (in this case you may think of it as a class).
It is implemented by extending [Backbone.Model](http://backbonejs.org/#Model).
This means that [Backbone.Events](http://backbonejs.org/#Events) methods and
events are available.

This constructor is private (not globally available), but documenting it is
a necessary part of explaining how the other APIs are used.

### PendingCollection

This is a JavaScript constructor (in this case you may think of it as a class).
It is implemented by extending [Backbone.Collection](http://backbonejs.org/#Collection).
This means that [Backbone.Events](http://backbonejs.org/#Events) methods and
events are available.

This constructor is private (not globally available), but documenting it is
a necessary part of explaining how the other APIs are used.

### BMP.BIC.pending = new PendingCollection()

This is globally-accessible object created via the `PendingCollection`
constructor.

### BMP.BIC.pending.create = function (model)

- @param {Object} model see the Form Records Data Model (`model.id` is optional)
- @returns {PendingItem}

Asynchronously stores a new model in the pending queue. A unique UUID will be
assigned to that entry in the pending queue while it is being stored.

```javascript
var pendingRecord = BMP.BIC.pending.create({ /* see Data Model */ });
pendingRecord.once('change', function () {
  // pendingRecord.id is now available, indicating that the record is saved
});
```

### BMP.BIC.pending.processQueue = function ()

Processes each PendingItem in the queue. If the `status` property is `Pending`,
then an attempt will be made to submit the entry to the server. All other values
of `status` cause the PendingItem to be skipped.
