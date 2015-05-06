# BIC-jQM: Pending Queue Process

1. the user clicks the submit button

2. the click-handler for the submit button is the `formSubmit()` method of the
  [FormControlView](../src/view-form-controls.js)

3. `formSubmit()` calls the `addToQueue(status)` method, with a status of
  "Pending" which declares that the form record is ready for submission

    - any other status (e.g. "Draft") saves the form record locally and does not
      trigger network submission

4. `addToQueue()` retrieves the data from the current form record and stores it
  along with some form metadata to the `BMP.BIC.pending` Backbone Collection

5. `addToQueue()` calls `BMP.BIC.pending.processQueue()` and then navigates away
  from the form interaction, allowing the submission to complete in the
  background

6. the [PendingCollection](../src/collection-pending.js)'s `processQueue()`
  method identifies all pending items with a "Pending" status and attempts to
  submit them via the network

7. event handlers created in `addToQueue()` display the successful submission
  pop-up
