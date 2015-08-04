# Changelog


## v3.8.1 - 2015-08-04


### Fixed

- BIC-190: jQM transitions that depend on CSS Animation events now have a
  watchdog timer, so missing events no longer break everything

- BIC-165: answerSpaces lacking home interactions and login security no longer
  fail to start (introduced in v3.8.0)


## v3.8.0 - 2015-07-30


### Added

- BIC-168: display validation messages from the server next to client-side
  validation messages

- BIC-174: APIs, events and documentation for managing custom and server-side
  validation messages for use with Forms

    - see [docs/pending-queue.md](docs/pending-queue.md)


### Changed

- update to Forms v3.4.2 for additions, changes and fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.4.2

### Fixed

- BIC-165: unauthenticated users navigating to a protected answerSpace are now
  prompted to login (as per answerSpace settings)

- BIC-189: forms validation error summary is consistently enhanced by
  jQueryMobile

    - the summary is also now displayed when changing the page or when pressing
      the submit button

    - we no longer display the summary upon form load, nor after pressing the
      save button


## v3.7.1 - 2015-07-28


### Changed

- update to Forms v3.4.1 for additions, changes and fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.4.1


## v3.7.0 - 2015-07-17


### Changed

- update to Forms v3.4.0 for additions, changes and fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.4.0
