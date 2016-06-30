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
    BMP.BIC.whenPopulated().then(function () {

      /* here your code can safely manipulate the pending queue */

    });
  });
});
```

Just checking the Promise should be all that is necessary for
Interaction-specific and Form Behaviour-specific code:

```javascript
BMP.BIC.whenPopulated().then(function () {

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

**Methods**
- `#process()`
- `#setErrors(errors)`

`#process()` will process the pending model, regardless of its status, and return a promise. The promise will be resolved if the result from the server is a 200 OK, and rejected if it is anything else. 

`#setErrors(errors)` is called by `#process` when the server responds with failure. The pending model has its status attribute set to [MODEL_STATUS.FAILED_VALIDATION](../src/bic/enum-model-status.js) and the errors are processed using the [BlinkForms Error](https://github.com/blinkmobile/forms/blob/develop/docs/errors.md) helpers and then saved to the errors attribute. Finally, the model is saved to persistant storage in the pending queue. A `Native Promise` is returned when the persiting has completed.  See the [error details](error-details.md) documentation for more information on working with errors that come from the Blink Mobility Platform.

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

### BMP.BIC.pending.processQueue = function (options)

Processes each PendingItem in the queue. By default, only models with a `status` property of `Pending`, will be processed and an attempt made to submit the entry to the server. All other values of `status` cause the PendingItem to be skipped. However, if `options` has a `status` property, this status will be used instead:

    BMP.BIC.pending.processQueue({status: MODEL_STATUS.FAILED_VALIDATION});
    // only models with a status of MODEL_STATUS.FAILED_VALIDATION will be processed.

`#processQueue()` returns an [aggregated promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) of every pending model's submission. The promise is rejected on the first model that receives a non 200 response from the server.

### BMP.BIC.pending.retryFailed = function()

Syntactic sugar for `BMP.BIC.pending.processQueue({status: MODEL_STATUS.FAILED_VALIDATION});`

### BMP.BIC.pending.getFailedSubmissions = function()

Returns a subset of `BMP.BIC.pending` as a `PendingCollection`. Every model in this subset has a status attribute of `MODEL_STATUS.FAILED_VALIDATION`

###BMP.BIC.pending.getByFormName = function(name)

Returns a subset of `BMP.BIC.pending` as a `PendingCollection`. Every model in this subset has a name attribute of `name`


##Displaying errors stored in the pending queue
Errors stored on a BlinkForm in the pending queue are set at form render time. If you need to display errors on a form in real time, use [BlinkForms Errors](https://github.com/blinkmobile/forms/blob/develop/docs/errors.md) (see "Manually Setting Element Errors")

##Saving errors to the pending queue

Errors sent from the Blink Mobility Platform are persisted automatically via the `PendingModel` instances `#process()` function. If you need to persist your own messages, you will need to consider the following:

- The `errors` attribute of a pending model is considered to be a set of errors for BlinkForms to use.
- BlinkForms Error objects must be in the specified format.
- `PendingModel#setErrors` will not merge any existing errors.
- `PendingModel#setErrors` sets the errors for the entire form.

Because the pending queue is a [backbone collection](http://backbonejs.org/#Collection) any events that a model broadcasts are re-broadcasted by the collection. This means that you can listen to `change:errors`, `add`, `remove` events.

##Event Life cycle

`'add'` -> `'change'` -> `'change:errors'` -> `'remove'`

The above events are broadcast on the pending queue collection.

##Finding a particular pending form

All pending models are given a unique id called "pid". This can be obtained by querying the arguments for the current interaction:

    var pid = BMP.BIC.currentInteraction.getArgument('pid');

Once you have the pid, you can use standard backbone functions to retrieve it from the pending collection:

    var pendingModel = BMP.BIC.pending.get(pid);
