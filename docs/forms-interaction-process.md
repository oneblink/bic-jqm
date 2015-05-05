# BIC-jQM: Forms Interaction Process

This is the Forms-specific process that the InteractionView performs during the
[navigation process](navigation-process.md).

1. the InteractionView creates a new [FormView](../src/view-form.js)

2. the FormView creates a new [FormActionView](../src/view-form-action.js) if
  the form is an add, edit, view or delete action

3. the FormActionView retrieves the desired form' definition using
  `BMP.Forms.getDefinition(name, action)`

4. the FormActionView creates a new [FormControlView](../src/view-form-controls.js)

5. the FormControlView uses a Mustache template to create the save and submit
  buttons

6. the FormActionView uses the Forms library to initialise, render and populate
  (if necessary) the desired form
