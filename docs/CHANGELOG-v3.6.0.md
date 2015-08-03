# Changelog


## v3.6.0 - 2015-07-17


### Added

- BIC-171: Forms validation error summary above the submit button


### Changed

- BIC-188: pending queue refactored and extensibility improved

    - see [docs/mustache/pending.md](docs/mustache/pending.md) for details


### Fixed

- BIC-187: fix Promise dependency causing issues with Android 4.3 and iOS 7

- BIC-180: Forms pagination controls kept in sync with page turns via API

- BIC-164: KML maps configured via MADL behave as expected

    - HelpDesk: 2344-YHLX-0647

- BIC-186: Forms List Interactions behave as expected


## v3.5.3 - 2015-06-26


### Fixed

- update to Forms v3.3.5 for improvements


## v3.5.2 - 2015-06-26


### Fixed

- BIC-181: access jQuery once available in native apps (instead of too soon)

- BIC-178: Save Draft button on Forms no longer triggers navigation

- BIC-179: render SubForms properly after turning Form Pages

- BIC-157: saving a Draft and submitting does not create duplicate Pending
  Queue entries


## v3.5.1 - 2015-06-24


### Fixed

- update to Forms v3.3.4 for improvements


## v3.5.0 - 2015-06-24


### Added

- BIC-152: new Suitcase and Interaction operators for Forms Behaviours

    - combined with FORMS-163 and PLATFORM-1558 (BMP v2.26.0), the Cascading
      Selects feature from the Form Builder is now supported

- BIC-172: allow replacement of View constructor used for Forms Controls, e.g.

    ```js
    require([
      'backbone'
      'bic',
      'bic/view-form-controls'
    ], function (Backbone, BIC, FormControlsView) {
      // override parts of our implementation
      BIC.views.FormControls = FormControlsView.extend({ /* ... */ });
      // OR ... complete replacement (advanced)
      BIC.views.FormControls = Backbone.View.extend({ /* ... */ });
      // OR ... return to default
      BIC.views.FormControls = null;
    });
    ```


### Changed

- BIC modules are no longer private, all can be `require()`ed globally

    - improves determinism during boot, improves maintainability

    - offers new avenues for extensibility


### Fixed

- BIC-161: if Require.js and/or modules timeout during boot, reload

    - and direct unsupported browsers (e.g. IE8) to http://outdatedbrowser.com/

- BIC-177: fixed console error triggered when closing then saving a form


## v3.4.2 - 2015-06-17


### Fixed

- BIC-154: further clean-up, `BMP.BIC` is still a `Backbone.Model` but is no
  longer persisted to storage

- BIC-175: fix BlinkGap detection so that BIC can boot in native iOS / Android


## v3.4.1 - 2015-06-12


### Changed

- update to Forms v3.3.3


## v3.4.0 - 2015-06-12


### Added

- BIC-146: APIs to control navigation after form submissions

    - see comments in [src/model-form.js](src/model-form.js) for details


### Fixed

- BIC-145: prevent forms submissions from navigating backwards too far

    - this would sometimes navigate back beyond the answerSpace

- BIC-154: allow native apps to use IndexedDB when WebSQL is unavailable

    - native apps would try WebSQL then fallback to in-memory (no persistence)

    - this is important for our upcoming Windows apps

- BIC-155: prevent users tapping submit button more than once during submission

- BIC-159: don't display the pending queue upon failed client-side validation

- BIC-160: support apostrophes in URL query string arguments

- BIC-163: for URLs `?args[pid]=xxx` do not assume `xxx` is in the pending queue

    - this would throw exceptions when addressing an entry that no longer exists


## v3.3.4 - 2015-05-22

### Changed

- update to Forms v3.3.2


## v3.3.3 - 2015-05-22

### Changed

- update to [jQuery 1.11.3](http://blog.jquery.com/2015/04/28/jquery-1-11-3-and-2-1-4-released-ios-fail-safe-edition/)
  from 1.9.1 for fixes and improvements

- BIC-143: make the forms Save draft button directly visible, not in a pop-up


### Fixed

- BIC-144: when the current form has validation errors, prevent submissions

    - saves a draft with the current record data will instead

- BIC-148: clean up console errors triggered when switching browser tabs


## v3.3.2 - 2015-05-11

### Changed

- update to Forms v3.3.1


## v3.3.1 - 2015-05-06

### Changed

- update to Forms v3.3.0 and drop blobUploader functionality


## v3.3.0 - 2015-05-06

### Changed

- BIC-129: use If-Modified-Since HTTP header when requesting server-side
  Data Suitcases, instead of using a query string argument

    - improves compatibility with our upcoming Windows native app

- BIC-147: disable pending queue and all related behaviour when no persistent
  storage mechanism is available

    - see https://github.com/blinkmobile/bic-v3/pull/3 for details

    - `BMP.BIC.pending` is not available in this situtation

    - form submissions bypass the queue and go directly to the server

### Fixed

- BIC-142: improve URL routing when running from file:///, etc

    - improves compatibility with our upcoming Windows native app

    - includes slight streamlining of boot sequence so that Data Suitcases and
      Forms Definitions do not block the boot process


## v3.2.4 - 2015-04-13

### Changed

- update to Forms v3.2.1 and activate the blobUploader


## v3.2.3 - 2015-04-13

### Fixed

- BIC-140: switching tabs away from a form should no longer cause a reload


## v3.2.2 - 2015-03-31

### Changed

- update to Forms v3.2.0


## v3.2.1 - 2015-03-31

### Fixed

- BIC-136: behave offline-first when native plugin is available

    - corrects issue where non-offline-first native app shell broke
